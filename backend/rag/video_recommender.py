from googleapiclient.discovery import build
from dotenv import load_dotenv
import os

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def get_youtube_service():

    return build(
        "youtube",
        "v3",
        developerKey=YOUTUBE_API_KEY
    )


def search_youtube_videos(topic, max_results=5):

    youtube = get_youtube_service()

    request = youtube.search().list(
        q=f"{topic} educational tutorial",
        part="snippet",
        maxResults=max_results,
        type="video",
        videoDuration="medium",
        relevanceLanguage="en"
    )

    response = request.execute()

    videos = []

    for item in response["items"]:

        video_id = item["id"]["videoId"]

        videos.append({
            "title": item["snippet"]["title"],
            "channel": item["snippet"]["channelTitle"],
            "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
            "url": f"https://www.youtube.com/watch?v={video_id}"
        })

    return videos