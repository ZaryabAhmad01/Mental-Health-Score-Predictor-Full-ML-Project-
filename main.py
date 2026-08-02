from joblib import load
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel , Field
from typing import Annotated , Literal
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

try:
    Model= load("Mental_Health_Model.pkl")
    print("Model loaded successfully.")
except Exception as e:
    Model= None
    print(f"Error loading model: {e}")




# top country freatres 
top_country=['Other',
 'India',
 'USA',
 'Canada',
 'Australia',
 'UK',
 'Germany',
 'Turkey',
 'Mexico',
 'France']


app= FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    )

class user_input(BaseModel):
    Age:Annotated[int,Field(..., gt=10,le=110,description="Please enter your Age ")]
    Gender:Literal["Male", "Female"]
    Country:Annotated[str,Field(..., description="Enter your Country Name")]
    Academic_Level:Literal["Undergraduate", "Graduate", "High School"]
    Most_Used_Platform:Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter',
                               'YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp',
                               'WeChat']
    Purpose_Of_Use:Literal['Networking', 'Education', 'Entertainment', 'News']
    Avg_Daily_Usage_Hours:Annotated[float,Field(...,gt=0,le=24,description="Please enter your Avg Daily Usage Hours")]
    Daily_Unlocks:Annotated[int,Field(...,gt=0,description="Please enter your Daily Unlocks")]
    Study_Hours:Annotated[float,Field(...,gt=0,le=24,description="Please enter your Study Hours")]
    Physical_Activity_Hours:Annotated[float,Field(...,gt=0,le=24,description="Please enter your Physical Activity Hours")]
    Sleep_Hours_Per_Night:Annotated[float,Field(...,gt=0,le=24,description="Please enter your Sleep Hours Per Night")]
    Stress_Level:Literal['Medium', 'Low', 'Very High', 'High']


@app.get("/")
def greet():
    return {"WellCome to Zaryab AI/ML  engineer at AIHOUSE"}




@app.post("/predict")
def predict(data: user_input):
    if Model is None:
        return JSONResponse(content={"error": "Model not loaded"}, status_code=500)

    Country_grouped=data.Country if data.Country in top_country else "Other"

    input_row= pd.DataFrame([{
        'Age':data.Age, 
        'Gender':data.Gender, 
        'Country':Country_grouped, 
        'Academic_Level':data.Academic_Level, 
        'Most_Used_Platform':data.Most_Used_Platform,
        'Purpose_Of_Use':data.Purpose_Of_Use,
        'Avg_Daily_Usage_Hours':data.Avg_Daily_Usage_Hours, 
        'Daily_Unlocks':data.Daily_Unlocks,
        'Study_Hours':data.Study_Hours, 
        'Physical_Activity_Hours':data.Physical_Activity_Hours,
        'Sleep_Hours_Per_Night':data.Sleep_Hours_Per_Night,
        'Stress_Level':data.Stress_Level

    }])


    try:
        prediction=Model.predict(input_row)[0]
        return JSONResponse(content={"Predict":f"your Mental Health Score is {prediction}"},status_code=200)
    except Exception as e:
        return JSONResponse(status_code=500,content={"server error":f"prediction is fail {e}"})





    




    






#  Age', 'Gender', 'Country', 'Academic_Level', 'Most_Used_Platform',
#        'Purpose_Of_Use', 'Avg_Daily_Usage_Hours', 'Daily_Unlocks',
#        'Study_Hours', 'Physical_Activity_Hours', 'Sleep_Hours_Per_Night',
#        'Stress_Level', 'Mental_Health_Score ' 