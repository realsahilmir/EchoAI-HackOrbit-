import openai

def summarize_text(text):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Summarize this conversation."},
            {"role": "user", "content": text}
        ]
    )
    return response["choices"][0]["message"]["content"]

def tag_text(text):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Extract key topics and names."},
            {"role": "user", "content": text}
        ]
    )
    return response["choices"][0]["message"]["content"].split(", ")
