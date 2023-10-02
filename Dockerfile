FROM public.ecr.aws/lambda/python:3.9

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY src/controllers/open-ai-pred.py ./

RUN echo ls
 
# You can overwrite command in `serverless.yml` template
CMD ["open-ai-pred.handler"]