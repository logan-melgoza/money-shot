import requests 
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import json 
import schedule 
import threading




Mongo_database = "NBA_Statistics"
Mongo_collection = "NBA_Players"


client = MongoClient(connection_string, server_api=ServerApi('1'))
try:
    database = client[Mongo_database]
    collection = database[Mongo_collection]
    client.admin.command('ping')
    print(" You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection error: {e}")

def collect_data(params={}):
    endpoint_url = f'{url}players'
    try:
        response = requests.get(endpoint_url, headers=headers, params=params)
        print("API Response:", response.json())  # Print the entire response
        if response.status_code == 200:
            data = response.json()
            players = data.get('response', [])
            print(f"Fetched {len(players)} players from the API.")
            return players
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
            print(f"Inserted {len(data)} players into MongoDB.")
        except Exception as e:
            print(f"Error inserting data into MongoDB: {e}")
    else:
        print("No data to insert.")

def main():
        query_params = {'season': '2024', 'team': "41"}
        players_data = collect_data(query_params)
        insert_data_into_mongodb(players_data)


if __name__ == "__main__":

    main()

