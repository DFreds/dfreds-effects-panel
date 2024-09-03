<div align="center">
  <img src="https://i.imgur.com/gOZy3Jf.png" width="200" height="200"/>
</div>
<h1 align="center">DFreds Effects Panel</h1>

<h4 align="center">
  <a href="https://foundryvtt.com/packages/dfreds-effects-panel">Install</a>
  ·
  <a href="https://discord.gg/Wq8AEV9bWb">Discord</a>
  ·
  <a href="https://github.com/topics/dfreds-modules">Other Modules</a>
</h4>

<p align="center">
    <a href="https://github.com/DFreds/dfreds-effects-panel/pulse"><img src="https://img.shields.io/github/last-commit/DFreds/dfreds-effects-panel?style=for-the-badge&logo=github&color=7dc4e4&logoColor=D9E0EE&labelColor=302D41"></a>
    <a href="https://github.com/DFreds/dfreds-effects-panel/releases/latest"><img src="https://img.shields.io/github/v/release/DFreds/dfreds-effects-panel?style=for-the-badge&logo=gitbook&color=8bd5ca&logoColor=D9E0EE&labelColor=302D41"></a>
    <a href="https://github.com/DFreds/dfreds-effects-panel/stargazers"><img src="https://img.shields.io/github/stars/DFreds/dfreds-effects-panel?style=for-the-badge&logo=apachespark&color=eed49f&logoColor=D9E0EE&labelColor=302D41"></a>
    <br>
    <br>
    <img src="https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/DFreds/dfreds-effects-panel/main/static/module.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=fe6a1f&style=for-the-badge&logo=foundryvirtualtabletop">
    <a href="https://forge-vtt.com/bazaar#package=dfreds-effects-panel"><img src="https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https://forge-vtt.com/api/bazaar/package/dfreds-effects-panel&colorB=68a74f&style=for-the-badge&logo=condaforge"></a>
    <br>
    <img src="https://img.shields.io/github/downloads/DFreds/dfreds-effects-panel/latest/dfreds-effects-panel.zip?color=2b82fc&label=LATEST%20DOWNLOADS&style=for-the-badge">
    <img src="https://img.shields.io/github/downloads/DFreds/dfreds-effects-panel/total?color=2b82fc&label=TOTAL%20DOWNLOADS&style=for-the-badge">
    <br>
    <br>
    <a href="https://www.patreon.com/dfreds"><img src="https://img.shields.io/badge/-Patreon-%23f96854?style=for-the-badge&logo=patreon"></a>
    <a href="https://www.buymeacoffee.com/dfreds"><img src="https://img.shields.io/badge/-Buy%20Me%20A%20Coffee-%23ff813f?style=for-the-badge&logo=buymeacoffee"></a>
    <a href="https://discord.gg/Wq8AEV9bWb"><img src="https://img.shields.io/badge/-Discord-%235865f2?style=for-the-badge"></a>
</p>

<p align="center">
    <b>DFreds Effects Panel</b> is a FoundryVTT module that adds a panel of active effects for the selected token.
</p>

## Let Me Sell You This

Do you find it annoying to have to open up the character sheet just to see what
effects are applied? Is it annoying to delete them or edit them on the fly?
Well, this module makes that slightly less annoying! Yay...?

## What This Module Does

On selecting a token on the canvas, this module shows a little panel in the top
right of all the currently active effects for that actor. From here, you can do
the following:

- You can hover over the icon to see the name, description (if using DFreds
  Convenient Effects), and the time remaining. This integrates nicely with
  modules that handle time management such as Simple Calendar to show the time
  until it expires. When an effect runs out of time, it will be labeled with
  "Expired".
- You can double click the icon to immediately open the configuration sheet for
  that effect.
- You can configure the behavior when you right click a passive or temporary effect to either
  - Immediately disable the effect
  - Immediately delete the effect
  - Show a dialog to let you pick what to do

![Effects Panel](docs/effects-panel.png)

You can configure some stuff:

![Settings](docs/settings.png)

## Required Modules

- [libWrapper](https://foundryvtt.com/packages/lib-wrapper) by ruipin - A
  library that wraps core Foundry methods to make it easier for modules
  developers to do their thang. Note that if you for some reason don't want to
  install this, a shim will be used instead. You'll be pestered to install it
  though so... [just do it](https://www.youtube.com/watch?v=ZXsQAXx_ao0)

## Modules That Help

While not strictly required, the functionalities provided by these modules
drastically improve the usage of the features in this module.

- [DFreds Convenient Effects](https://foundryvtt.com/packages/dfreds-convenient-effects) by DFreds (hey that's me) - Includes a ton of pre-configured effects for the DnD 5e system. It also adds a description box to the active effect config sheet which will be displayed on the effects panel.
- [Simple Calendar](https://foundryvtt.com/packages/foundryvtt-simple-calendar) by vigorator - Handles all your game time management needs
- [Times Up](https://foundryvtt.com/packages/times-up) by tposney - Deletes effects when their time is up or after a certain number of rounds or turns

## This Looks Familiar

If you've ever played the Pathfinder 2e system on Foundry, this module is going
to look very familiar. That is because it almost a straight port of their
feature for doing the same thing. However, now you can have that nice bit of
functionality in any game system!

For obvious reasons, it is not recommended to use this module in conjunction
with the Pathfinder 2e system.
