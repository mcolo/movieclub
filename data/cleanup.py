import pandas as pd

df1 = pd.read_csv('title.basics.tsv', sep='\t', header=0)
df2 = pd.read_csv('title.ratings.tsv', sep='\t', header=0)
result = pd.merge(df1, df2, on='tconst', how='left')
result = result.drop(result.columns[[3, 4, 6, 7, 8]], axis=1)
result = result.loc[result["titleType"] == "movie"]
result = result.drop(result.columns[1], axis=1)
result.to_csv('titles_and_ratings.tsv', sep='\t', index=False)

# df = df.drop(df.columns[[3, 4, 5, 6, 7, 8]], axis=1)
# df = df[~df.titleType.str.contains('tvEpisode')]
# df = df[~df.titleType.str.contains('short')]
# df = df.drop(df.columns[1], axis=1)
# df.to_csv('title.basics.clean4.tsv', index=False, sep="\t")

# df = pd.read_csv('title.basics.clean4.tsv', sep='\t', header=0)
# df.to_json('moviedata.json','records')