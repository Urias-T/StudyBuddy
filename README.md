# StudyBuddy 🔍
An AI-powered chat interface for querying PDF documents. Built using Langchain, OpenAI, Pinecone, and NextJS 13.

## Running Locally 💻

Follow these steps to set up and run the service locally :

### Prerequisites
- Next.js
- LangchainJS
- PineCone Vector Database

To run this app, you need the following:

1. An [OpenAI](https://platform.openai.com/) API key
2. [Pinecone](https://app.pinecone.io/) API Key

### Installation
1. Clone the repository :

```
git clone https://github.com/Urias-T/StudyBuddy
```

2. Navigate to the project directory :

```
cd StudyBuddy
```

3. Install dependencies :

```
npm install
```

4. Create a ```.env.local``` file and populate it with your "OPENAI_API_KEY", "PINECONE_API_KEY" and "PINECONE_ENVIRONMENT" variables.
   
5. Create a directory ```documents``` and include the pdf files you want to query.

6. Run the app:

```
npm run dev
```

That's it! The web app would be running on ```localhost:3000```. 🤗

## Usage 👍🏽
The first time you run the app, you need to run the setup flow: 

   1. Put your pdf files in the ```documents``` directory.
   2. Click on the "Create index and embeddings" link to trigger the setup of your Pinecone index with your documents.

After the initial setup, you only need to ask questions in the text box and the LLM would respond using your document embeddings as context. 

## Contributing 🙌🏽
If you want to contribute to this project, please open an issue and submit a pull request.


## License ⚖️
This project is made available under the [MIT License](https://github.com/Urias-T/StudyBuddy/blob/main/LICENSE). 
