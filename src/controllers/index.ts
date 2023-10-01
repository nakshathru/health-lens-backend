export const handler = async () => {
  try {
    return {
      message: 'success'
    }
  } catch (error) {
    console.error('Error occured');
  }  
};