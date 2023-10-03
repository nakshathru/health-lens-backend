	
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain.prompts import PromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.output_parsers import OutputFixingParser

from boto3.dynamodb.types import TypeDeserializer, TypeSerializer
import boto3
import json

dynamodb = boto3.resource('dynamodb')

table = dynamodb.Table('health-lens-results')
llm = OpenAI(openai_api_key="<APIKEY>")

def handler(event, context):

    payload = dynamo_obj_to_python_obj(event['Records'][0]['dynamodb']['NewImage'])

    if(payload['type'] != 'raw'):
        return
    
    convo = payload['conversation']['channel1']
    patientId = payload['patientId']

    response_schemas = [
    ResponseSchema(name="diagnosis", description="medical diagnosis made by the doctor and suspected medical conditions and possible treatment"),
    ResponseSchema(name="symptoms", description="symptoms mentioned in the user's question in detail."),
     ResponseSchema(name="causes", description="possible cuases for the patients symptoms in detail"),
     ResponseSchema(name="medication", description="recommended medications and prescription")
    ]
    output_parser = StructuredOutputParser.from_response_schemas(response_schemas)

    new_parser = OutputFixingParser.from_llm(parser=output_parser, llm=llm)

    format_instructions = output_parser.get_format_instructions()
    prompt = PromptTemplate(
        template="provide medical recommendations including detailed diagnosis and possible causes for the symptoms from the following doctor patient conversation. Mention the medical condition the patient may have and the treatment required. Include the recommended medications and prescription for the patient. Consider this as the first conversation without any prior context \n{format_instructions}\n{conversation}",
        input_variables=["conversation"],
        partial_variables={"format_instructions": format_instructions}
    )

    _input = prompt.format_prompt(conversation=convo)
    output = llm(_input.to_string())
    response = new_parser.parse(output)

    data_to_insert = {
        "patientId": patientId,
        "type": "openAI",
        "data": response
    }
    response = table.put_item(Item=data_to_insert)
    return response


def dynamo_obj_to_python_obj(dynamo_obj: dict) -> dict:
    deserializer = TypeDeserializer()
    return {
        k: deserializer.deserialize(v) 
        for k, v in dynamo_obj.items()
    }  
