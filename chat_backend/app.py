from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from langchain.chains import RetrievalQA
from langchain_community.chat_models import ChatOpenAI
from langchain.vectorstores import FAISS  # or FAISS if used in notebook
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import openai
import PyPDF2
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY", "")
detected_text = ''
qa_interface = None
chat_history = []

# Initialize FastAPI app
app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize global variables for vectorstore and retrieval chain
vectorstore = None
retriever_chain = None

# Define data model for the request
class QueryRequest(BaseModel):
    question: str

def append_pdf(input_pdf, output_pdf_writer):
    """
    Append pages of input_pdf to output_pdf.

    Parameters:
        input_pdf (str): Path to the input PDF file.
        output_pdf (str): Path to the output PDF file.
    """
    # Open the input PDF file in read-binary mode
    with open(input_pdf, 'rb') as input_pdf_file:
        # Create PdfFileReader object for the input PDF
        input_pdf_reader = PyPDF2.PdfReader(input_pdf_file)

        # Add all pages of input PDF to the output PDF writer
        for page_num in range(len(input_pdf_reader.pages)):
            page = input_pdf_reader.pages[page_num]
            output_pdf_writer.add_page(page)

def extract_text_from_pdfs():
    global detected_text
    # Paths to the input PDF files
    input_pdf2 = 'SOFI-2023.pdf'
    input_pdf1 = 'SOFI-2024.pdf'
    output_pdf = 'CMPE-combined-HackathonContent.pdf'

    # Create a PdfFileWriter object for the output PDF
    output_pdf_writer = PyPDF2.PdfWriter()

    # Append content of input_pdf1 to output_pdf
    append_pdf(input_pdf1, output_pdf_writer)

    # Append content of input_pdf2 to output_pdf
    append_pdf(input_pdf2, output_pdf_writer)

    # Write the output PDF to the output file
    with open(output_pdf, 'wb') as output_pdf_file:
        output_pdf_writer.write(output_pdf_file)
    
    output_pdf_file.close()

    pdf_file = open(output_pdf, 'rb')

    # Create a PDF object
    pdf_reader = PyPDF2.PdfReader(pdf_file)

    # Loop through all the pages and extract text
    for page_num in range(len(pdf_reader.pages)):
        page = pdf_reader.pages[page_num]
        detected_text += page.extract_text() + '\n\n'

    # Close the PDF file
    pdf_file.close()

def retreive_chain():
    global qa_interface

    # Re-adjust chunking
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=100)
    texts = text_splitter.create_documents([detected_text])

    # Re-create the FAISS index with adjusted parameters
    directory = 'index_store'
    vector_index = FAISS.from_documents(texts, OpenAIEmbeddings())
    vector_index.save_local(directory)

    # Load and increase retrieval scope
    vector_index = FAISS.load_local('index_store', OpenAIEmbeddings(), allow_dangerous_deserialization=True)
    retriever = vector_index.as_retriever(search_type="similarity", search_kwargs={"k": 10})

    # Set up the refined chain type
    qa_interface = RetrievalQA.from_chain_type(
        llm=ChatOpenAI(temperature=0.3, streaming=True), 
        chain_type="refine", 
        retriever=retriever, 
        return_source_documents=True
    )

def chat(user_input):
    global qa_interface
    global chat_history
    bot_response = qa_interface(user_input)['result']
    response = ""
    for letter in bot_response:
        response+=letter
        yield letter
    chat_history.append((user_input, response))

@app.on_event("startup")
def startup_event():
    extract_text_from_pdfs()
    retreive_chain()

@app.post("/query")
def query_ir_system(request: QueryRequest):
    global qa_interface
    if not qa_interface:
        raise HTTPException(status_code=500, detail="The retrieval system is not initialized.")

    # Query the IR system with LLM
    response = StreamingResponse(chat(request.question), media_type="text/plain")
    return response