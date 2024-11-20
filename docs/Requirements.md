# Functional requirements for the Breaking Bad Album

[//]: # TODO: change the concept of "rarity" for the more appropriate term "hazard level"

## Scope

The aim is to create a browser-based trading card game themed around the
Breaking Bad universe, where users will be able to open daily card packs, obtain
cards of different rarities and trade them with others. The main objetive is
to obtain at least one card of each variety and complete the collection.

## Deliverables

- View designs
- User login/creation
- A dashboard/user profile/album view
- A public card market for posting trades
- Search functionality for the market and album
- Cards and Card packs

## Cards

Cards will have a 5:7 aspect ratio, a standard size of 2.5 inches width by 3.5
inches height and rounded edges with a 3.5mm radius. They will have designs for
the font and the back. The front will be composed of an image (a.k.a card art),
a title, a description, a rarity (stated in the card itself) and a frame whose
color is determined by said rarity. The back will consist of a single image
depicting the game's brand, whose color palette also matches that of the card's
rarity, outlined by a solid white 2mm border. The cards will not have types
(rarity is not considered a type) nor stats of any kind.

## Card packs

Each day users will be given one or more basic card packs which will drop a
random selection of available cards, allowing repeats. There are different types
of card pack, the user may randomly receive a pack of a different type with
better rewards instead of the basic one. The type of the pack may affect the
amount and base probability of rare cards, it may also ensure that a minimum
number of them are dropped. The users are not allowed to store more than one daily card
pack, nor can them trade card packs with each other.

## Rarities

Cards have a given rarity which determines the base probability of the card
being dropped when opening a pack. This probability may also be affected by the
type of card pack or other conditions yet to be determined (such as special
events or boosts). Rarities also have an associated color/color pallete used for
the design of the cards, no two rarities can have the same nor a similar color
palette.

## Dashboard
The dashboard consists of a box with several pages (from 1 to 6). The cards will be added to each page with their collection ID and displayed for viewing. 
Each page will have 2 columns and 5 rows of cards. 
Initially, the dashboard will have only one main page, but as the user unlocks different cards, other pages with different seasonal designs based on the series' theme will be enabled. 
The card on the dashboard will apply a zoom effect when the user clicks on it.

## Trade Market
The Trade Market is the official way to obtain a specific card.
Players can publish cards they do not like or they already have and exchange them for another card they want from another player.
The method to search for cards is either by viewing the main page or using the filter to search by name, ID, or rarity (FUTURE CHANGE).
When a player selects a card, the trade page will open.
(CONTINUE DISCUSSION FOR USE OF CARD OR POINTS).
Finally, once the trade is done, the card is added to the buyer's dashboard.


## Minimum viable product

- There should be at least 10 cards, covering all rarities
- There should be at least 3 rarities
- There should be at least 2 types of card packs
