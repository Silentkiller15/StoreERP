import streamlit as st
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

st.title("📦 StoreERP AI Assistant")

# Input area
user_input = st.text_input("Ask about your inventory or sales:")

if st.button("Generate"):
    if user_input:
        # Send query to Gemini
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=user_input
        )
        st.write("### AI Answer:")
        st.write(response.text)