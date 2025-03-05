import requests 
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import json 
import schedule 
import threading



url = "https://api-nba-v1.p.rapidapi.com/"
connection_string = "mongodb+srv://aryanvashishta78:AvuwVjAGAT2LCAyP@cluster1.xplu3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
Mongo_database = "NBA_Statistics"
Mongo_collection = "NBA_Teams"
headers = {
	"x-rapidapi-key": "8ad391f451mshf0bfbf49e83471ap1657a5jsnd03326d684b5",
	"x-rapidapi-host": "api-nba-v1.p.rapidapi.com"
}

APIendpoints = {"seasons","teams"}

client = MongoClient(connection_string, server_api=ServerApi('1'))
try:
    database = client[Mongo_database]
    collection = database[Mongo_collection]
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Function to collect data from API
def collect_data(endpoint, allData, params={}):
    endpoint_url = f'{url}{endpoint}'
    responseAPI = requests.get(endpoint_url, headers=headers, params=params)
    if responseAPI.status_code == 200:
        allData[endpoint] = responseAPI.json()
    else:
        print(f"No data found for endpoint: {endpoint}")


def print_data():
    allData = {}
    nbaThreads = []

    
    for endpoint in APIendpoints:
        nbaThread = threading.Thread(target=collect_data, args=(endpoint, allData))
        nbaThreads.append(nbaThread)
        nbaThread.start()

   
    for nbaThread in nbaThreads:
        nbaThread.join()

    
    if allData:
        record_data = {"data": allData}
        collection.insert_one(record_data)
        print("Data inserted into MongoDB")
    else:
        print("No data to insert")


print_data()