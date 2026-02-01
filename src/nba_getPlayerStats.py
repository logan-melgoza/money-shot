import requests 
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import schedule 
import time





url = "https://api-nba-v1.p.rapidapi.com/"
connection_string = "mongodb+srv://aryanvashishta78:AvuwVjAGAT2LCAyP@cluster1.xplu3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
Mongo_database = "NBA_Statistics"
Mongo_collection = "NBA_PlayerStatsPerID"
Mongo_collection2 = "NBA_Players"


client = MongoClient(connection_string, server_api=ServerApi('1'))
try:
    database = client[Mongo_database]
    collection = database[Mongo_collection]
    client.admin.command('ping')
    print(" You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection error: {e}") 

client = MongoClient(connection_string, server_api=ServerApi('1'))
try:
    database2 = client[Mongo_database]
    collection2 = database[Mongo_collection2]
    client.admin.command('ping')
    print(" You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection error: {e}") 

def collect_data(params={}):
    endpoint_url = f'{url}players/statistics'
    try:
        response = requests.get(endpoint_url, headers=headers, params=params)
        print("API Response:", response.json())  
        if response.status_code == 200:
            data = response.json()
            standings = data.get('response', [])
            print(f"Fetched {len(standings)} player stats from the API.")
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
        except Exception as e:
            print(f"Error inserting data into MongoDB: {e}")
    else:
        print("No data to insert.") 

def get_playerID():
    player_IDs = [] 
    for player in collection2.find({}, {"id": 1}):  
        player_IDs.append(player["id"])

    client.close()
    return player_IDs 

def main():
    playerIDs = get_playerID()
    length = len(playerIDs)
    for i in range(0,length):
        query_params = {'id': playerIDs[i] ,'season':2024}
        playerStat_data = collect_data(query_params)
        insert_data_into_mongodb(playerStat_data)



if __name__ == "__main__":

    main()
