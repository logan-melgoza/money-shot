import requests 
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime, timedelta



Mongo_database = "NBA_Statistics"
Mongo_collection = "NBA_TeamStatsSeason"


client = MongoClient(connection_string, server_api=ServerApi('1'))
try:
    database = client[Mongo_database]
    collection = database[Mongo_collection]
    client.admin.command('ping')
    print(" You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection error: {e}")

def collect_data(params={}):
    endpoint_url = f'{url}teams/statistics'
    try:
        response = requests.get(endpoint_url, headers=headers, params=params)
        print("API Response:", response.json())  
        if response.status_code == 200:
            data = response.json()
            stats = data.get('response', [])
            print(f"Fetched {len(stats)} team season stats from the API.")
            return stats
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
        except Exception as e:
            print(f"Error inserting data into MongoDB: {e}")
    else:
        print("No data to insert.")

def main():   
    i = 1; 
    while i<31:
        if (i == 3): 
            query_params = {"id": 31 ,"season":"2024"}
            teamSeason_data = collect_data(query_params)
            insert_data_into_mongodb(teamSeason_data)
            i = i + 1
        elif (i == 12):
            query_params = {"id": 38 ,"season":"2024"}
            teamSeason_data = collect_data(query_params)
            insert_data_into_mongodb(teamSeason_data)
            i = i + 1
        elif (i==13):
            query_params = {"id": 40 ,"season":"2024"}
            teamSeason_data = collect_data(query_params)
            insert_data_into_mongodb(teamSeason_data)
            i = i + 1
        elif (i==18):
            query_params = {"id": 41 ,"season":"2024"}
            teamSeason_data = collect_data(query_params)
            insert_data_into_mongodb(teamSeason_data)
            i = i + 1
        else: 
            query_params = {"id": i ,"season":"2024"}
            teamSeason_data = collect_data(query_params)
            insert_data_into_mongodb(teamSeason_data)
            i = i + 1
        


if __name__ == "__main__":

    main()

