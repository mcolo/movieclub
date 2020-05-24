import pandas as pd
from io import StringIO
from unidecode import unidecode
import requests
import gzip
import json

print("getting imdb data")
basics_gz = requests.get(
    "https://datasets.imdbws.com/title.basics.tsv.gz", stream=True
)
ratings_gz = requests.get(
    "https://datasets.imdbws.com/title.ratings.tsv.gz", stream=True
)

basics = gzip.decompress(basics_gz.content)
basics = str(basics, "utf-8")
basics = StringIO(basics)

ratings = gzip.decompress(ratings_gz.content)
ratings = str(ratings, "utf-8")
ratings = StringIO(ratings)

print("reading imdb data and creating merged dataframe")
df1 = pd.read_csv(basics, sep="\t", header=0)
df2 = pd.read_csv(ratings, sep="\t", header=0)
df1 = df1.drop(df1.columns[[3, 4, 6, 7, 8]], axis=1)
df3 = pd.merge(df1, df2, on="tconst", how="left")
df3 = df3.loc[df3["titleType"] == "movie"]
df3 = df3.drop(df3.columns[1], axis=1)

trie = {}
dataset = {}


def add_to_trie(title, id):
    node = trie
    title = unidecode(title)
    title = title.lower()
    for c in title:
        if not node.get(c):
            node[c] = {}
        node = node[c]
    node.setdefault("ids", []).append(id)


def add_to_dataset(id, title, year, weighted_rating):
    dataset[id] = {"t": title, "y": year, "r": weighted_rating}


print("buildling trie and dataset")
for row in df3.itertuples():
    add_to_trie(row.primaryTitle, row.tconst)
    add_to_dataset(
        row.tconst,
        row.primaryTitle,
        row.startYear,
        (row.averageRating * row.numVotes),
    )

print("writing autocomplete_trie")
with open("autocomplete_trie.json", "w") as f:
    json.dump(trie, f)

print("writing autocomplete_dataset")
with open("autocomplete_dataset.json", "w") as f:
    json.dump(dataset, f)
