# Functional requirements for the Breaking Bad Album

<!-- TODO: change the concept of "rarity" for the more appropriate term "hazard level" -->

## Scope

<p align="justify">

The aim is to create a browser-based trading card game themed around the
Breaking Bad universe, where users will be able to open daily card packs, obtain
cards of different rarities and trade them with others. The main objetive is to
obtain at least one card of each variety and complete the collection.

</p>

## Deliverables

- View designs
- User login/creation
- A dashboard/user profile/album view
- A public card market for posting trades
- Search functionality for the market
- Cards and Card packs

## Cards

<p align="justify">

Cards will have a 5:7 aspect ratio, a standard size of 2.5 inches width by 3.5
inches height and rounded edges with a 3.5mm radius. They will have designs for
the font and the back. The front will be composed of an image (a.k.a card art),
a title, a description, a rarity (stated in the card itself) and a frame whose
color is determined by said rarity. The back will consist of a single image
depicting the game's brand, whose color palette also matches that of the card's
rarity, outlined by a solid white 2mm border. Each card has an associated season
from the show, being the season where the card's theme first appeared and/or was
more prominent. The cards will not have stats of any kind.

</p>

## Card packs

<p align="justify">

Each day users will be given one or more basic card packs which will drop a
random selection of available cards, allowing repeats. There are different types
of card packs, the user may randomly receive a pack of a different type with
better rewards instead of the basic one. The type of the pack may affect the
amount and base probability of rare cards, it may also ensure that a minimum
number of them are dropped. The users are not allowed to store more than one
daily card pack, nor can them trade card packs with each other.

</p>

## Rarities

<p align="justify">

Cards have a given rarity which determines the base probability of the card
being dropped when opening a pack. This probability may also be affected by the
type of card pack or other conditions yet to be determined (such as special
events or boosts). Rarities also have an associated color/color pallete used for
the design of the cards, no two rarities can have the same nor a similar color
palette.

</p>

## Trades

<p align="justify">

A trade is a transaction where two different users agree to interchange any
amount of cards with each other. Users may trade multiple cards of different
varieties at a time; they may also accept or offer trades for nothing in return.
A user may trade all their cards of a given variety, in which case said variety
will either stop appearing in the user's collection or appear as if it hasn't
been unlocked. The user offering the trade decides which cards from their
collection they will offer and which cards they expect in return, they do not
have access to any collection other than their own when making this decision.
When a user receives a trade offer they can either deny or, if the user has the
requisite cards to complete the transaction, accept it. The trades themselves
have an expiration date set either by the user that offered it, or by the system
as a fallback. During the offer's lifetime its status is "pending", said state
allows the user that offered the trade to cancel it updating its status to
"cancelled". After a trade expires the transaction cannot be carried out, being
marked automatically as "expired". All trade offers whether they are accepted,
denied, expired, cancelled or pending, will appear in the user's trade history.
Trade offers can be made directly to a given user from their profile or publicly
to any user in the trade market, some mechanics may differ between public and
private trades. A user cannot trade with themselves and some card varieties may
be banned from trading.

</p>

### Trade Market

<p align="justify">

The game will feature a public market where card trades may be offered, the user
that offers the trade is referred to as the "poster". These offers will be
visible to any user, regardless of whether they can accept them. As trades
offered in the market are public, they cannot be "denied". However, they may
expire or be cancelled by the poster. The game will feature a search
functionality to allow for filtering the different offers in the market by their
creation date, status, cards offered, their rarity, etc.

</p>

## Dashboard

<p align="justify">

The dashboard will display the user's profile name, profile picture, the amount
of card packs opened, and the time remaining for the next daily card pack. From
the dashboard the user may change their profile name and or picture, access the
trade market, their collection, their active trade offers or their trade
history.

</p>

### Trade History

<p align="justify">

The trade history will display data such as the offerer, offeree, the date and
the cards exchanged from trades where the user was a participant. Such trades
may be filtered by a search function akin to the one featured in the trade
market, allowing the user to filter for their active offers.

</p>

### Collection

<p align="justify">

The user's collection will feature the cards they have obtained and hint to
those they have not. The cards will be displayed in a grid-like layout and
grouped by their season. When the user interacts with a card (e.g by clicking
and/or hovering over it) additional information, such as the date it was
unlocked and the quantity owned, will be shown.

</p>

## Minimum viable product

- There should be at least 10 cards, covering all rarities and seasons
- There should be at least 3 rarities
- There should be at least 2 types of card packs
- Trading, either directly or by the trade market, must be implemented
