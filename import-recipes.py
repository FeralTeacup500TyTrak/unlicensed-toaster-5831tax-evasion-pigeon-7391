
import json
import time
import urllib.request
from pathlib import Path

# Official Guild Wars 2 API
API = "https://api.guildwars2.com/v2"

# Save files relative to this script
PROJECT = Path(__file__).resolve().parent
OUTPUT = PROJECT / "data" / "chef-recipes.json"


def get_json(url):
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "GW2-Completion-Tracker/1.0"}
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def main():
    print("Connecting to the Guild Wars 2 API...")

    # Get every recipe ID
    recipe_ids = get_json(f"{API}/recipes")

    print(f"Found {len(recipe_ids)} recipe IDs.")
    print("Downloading recipes...")

    chef_recipes = []

    # The GW2 API supports batch requests.
    batch_size = 100

    for start in range(0, len(recipe_ids), batch_size):
        batch = recipe_ids[start:start + batch_size]
        ids = ",".join(str(recipe_id) for recipe_id in batch)

        url = f"{API}/recipes?ids={ids}"

        recipes = get_json(url)

        for recipe in recipes:
            if "Chef" in recipe.get("disciplines", []):
                chef_recipes.append(recipe)

        completed = min(start + batch_size, len(recipe_ids))

        print(
            f"Processed {completed}/{len(recipe_ids)} recipes "
            f"| Chef: {len(chef_recipes)}"
        )

        time.sleep(0.15)

    # Save the original API recipe data
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT.open("w", encoding="utf-8") as file:
        json.dump(
            chef_recipes,
            file,
            ensure_ascii=False,
            indent=2
        )

    print()
    print("Import completed!")
    print(f"Chef recipes found: {len(chef_recipes)}")
    print(f"Saved to: {OUTPUT}")


if __name__ == "__main__":
    main()
