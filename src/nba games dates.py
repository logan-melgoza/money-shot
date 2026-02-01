import requests 
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime, timedelta




url = "https://api-nba-v1.p.rapidapi.com/"
connection_string = "mongodb+srv://aryanvashishta78:AvuwVjAGAT2LCAyP@cluster1.xplu3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
Mongo_database = "NBA_Statistics"
Mongo_collection = "NBA_Games"


client = MongoClient(connection_string, server_api=ServerApi('1'))
try:
    database = client[Mongo_database]
    collection = database[Mongo_collection]
    client.admin.command('ping')
    print(" You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection error: {e}")

def collect_data(params={}):
    endpoint_url = f'{url}games'
    try:
        response = requests.get(endpoint_url, headers=headers, params=params)
        print("API Response:", response.json())  
        if response.status_code == 200:
            data = response.json()
            standings = data.get('response', [])
            print(f"Fetched {len(standings)} standings from the API.")
            return standings
        else:
            print(f"API request failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching data from API: {e}")
        return []

def insert_data_into_mongodb(data):
    if data:
        try:
            collection.insert_many(data)
            #print(f"Inserted {len(data)} standings into MongoDB.")
        except Exception as e:
            print(f"Error inserting data into MongoDB: {e}")
    else:
        print("No data to insert.")
def loop_through_dates(start_date_str, end_date_str):
    
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    
    dateList = []

    current_date = start_date
    while current_date <= end_date:
        dateList+=[current_date.strftime('%Y-%m-%d')]
        current_date += timedelta(days=1)

    return dateList

def main():
        start_date_str = '2024-10-22'
        end_date_str = '2025-04-13'
        nbaGameDate = loop_through_dates(start_date_str, end_date_str)
        i = 0
        while i < len(nbaGameDate): 
            query_params = {'date': nbaGameDate[i]}
            game_data = collect_data(query_params)
            insert_data_into_mongodb(game_data)
            i = i+1 
        



if __name__ == "__main__":

    main()
