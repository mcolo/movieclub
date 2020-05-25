from io import StringIO
from boto3 import resource
from gzip import decompress
from json import dump
from unidecode import unidecode
from requests import get


def add_to_trie(title, id, node):
    title = unidecode(title)
    title = title.lower()
    for c in title:
        if not node.get(c):
            node[c] = {}
        node = node[c]
    node.setdefault("ids", []).append(id)


def lambda_handler(event, context):
    basics_gz = get(
        "https://datasets.imdbws.com/title.basics.tsv.gz", stream=True
    )
    ratings_gz = get(
        "https://datasets.imdbws.com/title.ratings.tsv.gz", stream=True
    )

    basics = decompress(basics_gz.content)
    basics = str(basics, "utf-8")
    basics = StringIO(basics)

    ratings = decompress(ratings_gz.content)
    ratings = str(ratings, "utf-8")
    ratings = StringIO(ratings)

    trie = {}
    dataset = {}

    for line in basics:
        line = line.split("\t")
        if line[1] == "movie":
            add_to_trie(line[2], line[0], trie)
            dataset[line[0]] = {"t": line[2], "y": line[5]}

    for line in ratings:
        line = line.split("\t")
        if line[0] in dataset:
            dataset[line[0]]["r"] = float(line[1]) * int(line[2])

    with open("/tmp/autocomplete_trie.json", "w") as f:
        dump(trie, f)

    with open("/tmp/autocomplete_dataset.json", "w") as f:
        dump(dataset, f)

    s3 = resource("s3")
    s3.Bucket("movieclub-autocomplete").upload_file(
        "/tmp/autocomplete_trie.json", "autocomplete_trie.json"
    )
    s3.Bucket("movieclub-autocomplete").upload_file(
        "/tmp/autocomplete_dataset.json", "autocomplete_dataset.json"
    )
