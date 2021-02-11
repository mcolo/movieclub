from io import StringIO
from unidecode import unidecode
import requests
import gzip
import json
import csv

print("fetch imdb data")
basics_gz = requests.get(
    "https://datasets.imdbws.com/title.basics.tsv.gz", stream=True
)
ratings_gz = requests.get(
    "https://datasets.imdbws.com/title.ratings.tsv.gz", stream=True
)

print("unzip data")
basics = gzip.decompress(basics_gz.content)
basics = str(basics, "utf-8")
basics = StringIO(basics)

ratings = gzip.decompress(ratings_gz.content)
ratings = str(ratings, "utf-8")
ratings = StringIO(ratings)

trie = {}
dataset = {}
cleanset = {}
cleantrie = {}


def add_to_trie(title, id, t):
    node = t
    title = unidecode(title)
    title = title.lower()
    for c in title:
        if not node.get(c):
            node[c] = {}
        node = node[c]
    node.setdefault("ids", []).append(id)


print("loop data, build trie and dataset")
for line in basics:
    line = line.split("\t")
    if line[1] == "movie":
        add_to_trie(line[2], line[0], trie)
        dataset[line[0]] = {"t": line[2], "y": line[5]}

for line in ratings:
    line = line.split("\t")
    if line[0] in dataset:
        # dataset[line[0]]["r"] = float(line[1]) * int(line[2])
        cleanset[line[0]] = dataset[line[0]]

# for key,val in dataset.items():
#     if "r" in val:
#         cleanset[key] = val

for key,val in cleanset.items():
    add_to_trie(val["t"], key, cleantrie)
    # key is id, val.t is title

print("writing autocomplete_trie")
with open("autocomplete_trie.json", "w") as f:
    json.dump(cleantrie, f)

print("writing autocomplete_dataset")
with open("autocomplete_dataset.json", "w") as f:
    json.dump(cleanset, f)
