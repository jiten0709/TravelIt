# pip install requests
# pip install sqlalchemy
# pip install psycopg2-binary


import requests

apikey = "9DEEA1A6E2D245D096703C3F2B4274BC"
search_location = "LOTUS TEMPLE"
search_category = "attractions"

url_searchid = f"https://api.content.tripadvisor.com/api/v1/location/search?key={apikey}&searchQuery={search_location}&category={search_category}&language=en"

headers = {"accept": "application/json",
           "Referer": "https://example.com"}

response_sid = requests.get(url_searchid, headers=headers)
data = response_sid.json()

# print(response_sid.text)
print('------------------')

locationid = data['data'][0]['location_id']
place1 = data['data'][0]['name']
city1 = data['data'][0]['address_obj']['city']
print(locationid)
print(city1)
print(place1)

url_reviews = f"https://api.content.tripadvisor.com/api/v1/location/{locationid}/reviews?language=en&key={apikey}"
response_review = requests.get(url_reviews, headers=headers)
data_review = response_review.json()
# print(data_review)

# for item in data_review['data']:
#     text = item['text']
#     username = item['user']['username']
#     thumbnail = item['user']['avatar']['thumbnail']
#     rating = item['rating']


#     print(f'{text} --> {username} --> {rating} --> {thumbnail}')
#     print()

# -----------------------------------------------

from sqlalchemy import create_engine, Column, String, Integer, Text
from sqlalchemy.orm import sessionmaker, declarative_base

# Replace this with your actual database URL
DATABASE_URL = "postgresql://postgres:postgres@localhost/TravelIt"

Base = declarative_base()


class Review(Base):
    __tablename__ = "review"  # Name of your existing table
    __table_args__ = {'schema': 'travelit'}  # Specify the schema

    rev_id = Column(Integer, primary_key=True)
    name = Column(String(length=30))
    city = Column(String(length=30))
    place = Column(String(length=30))
    comment = Column(Text(length=500))
    rating = Column(Integer)


engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

for item in data_review['data']:
    text = item['text']
    username = item['user']['username']
    thumbnail = item['user']['avatar']['thumbnail']
    rating = item['rating']
    city = city1
    place = place1

    existing_data = Review(name=username, city=city, place=place, comment=text, rating=rating)
    session.add(existing_data)
    session.commit()

    print(f'{text} --> {username} --> {rating} --> {thumbnail}')
    print()

session.close()
