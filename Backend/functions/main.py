# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import os
from google.cloud import translate_v2 as translate

from firebase_functions import https_fn
from firebase_admin import initialize_app

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import openai

openai.api_key = "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"

initialize_app(
    options={
        "projectId": "mediscribe-ai",
    }
)


@https_fn.on_request()
def translate_text(req: https_fn.Request) -> https_fn.Response:
    try:
        # Parse the request body
        data = req.get_json()
        language_code = data.get("language_code")
        text = data.get("text")

        if isinstance(text, bytes):
            text = text.decode("utf-8")

        os.environ[
            "GOOGLE_APPLICATION_CREDENTIALS"
        ] = "./mediscribe-ai-f460598ca3f7.json"

        # Initialize the Translation client
        client = translate.Client()

        # Translate the text
        translation = client.translate(text, target_language=language_code)

        print("Text: {}".format(translation["input"]))
        print("Translation: {}".format(translation["translatedText"]))
        print(
            "Detected source language: {}".format(translation["detectedSourceLanguage"])
        )

        parsedResult = translation["translatedText"]

        return https_fn.Response(parsedResult)

    except Exception as e:
        print("[translate_text] error: ", e)
        return https_fn.Response("Error translating text")


@https_fn.on_request()
def on_request_example(req: https_fn.Request) -> https_fn.Response:
    try:
        engine = create_engine(
            "postgresql://postgres:mediscribe-ai@35.193.2.197/database"
        )
        Session = sessionmaker(bind=engine)
        session = Session()
        return https_fn.Response("Hello world!")
    except Exception as e:
        print(e)
        return https_fn.Response("Error connecting to database")


@https_fn.on_request()
def summarization(req: https_fn.Request) -> https_fn.Response:
    try:
        transcript = req.get_json().get("transcript")
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "Summarize this transcript from the perspective of a healthcare practitioner or patient. If not enough information is provided, ask the patient for more details.",
                },
                {"role": "user", "content": transcript},
            ],
        )
        print(completion.choices[0].message.content)
        return https_fn.Response(completion.choices[0].message.content)
    except Exception as e:
        print(e)
        return https_fn.Response("Error with summarization")
