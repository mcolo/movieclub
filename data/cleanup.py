import pandas as pd
from io import StringIO
import requests
import gzip

basics_gz = requests.get('https://datasets.imdbws.com/title.basics.tsv.gz', stream=True)
ratings_gz = requests.get('https://datasets.imdbws.com/title.ratings.tsv.gz', stream=True)

basics = gzip.decompress(basics_gz.content)
basics = str(basics, 'utf-8')
basics = StringIO(basics)

ratings = gzip.decompress(ratings_gz.content)
ratings = str(ratings, 'utf-8')
ratings = StringIO(ratings)

df1 = pd.read_csv(basics, sep='\t', header=0)
df2 = pd.read_csv(ratings, sep='\t', header=0)
df1 = df1.drop(df1.columns[[3, 4, 6, 7, 8]], axis=1)
result = pd.merge(df1, df2, on='tconst', how='left')
result = result.loc[result["titleType"] == "movie"]
result = result.drop(result.columns[1], axis=1)
result.to_csv('titles_and_ratings.tsv', sep='\t', index=False)
