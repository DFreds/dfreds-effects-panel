import { ClientBaseActiveEffect } from "types/foundry/client/data/documents/client-base-mixes.js";
import { fields } from "types/foundry/common/data/module.js";

declare global {
    namespace globalThis {
        let CONFIG: Config<
            AmbientLightDocument<Scene | null>,
            ActiveEffect<null>,
            Actor<null>,
            ActorDelta<null>,
            ChatLog,
            ChatMessage,
            Combat,
            Combatant<null, null>,
            CombatTracker<null>,
            CompendiumDirectory,
            Hotbar,
            Item<null>,
            Macro,
            MeasuredTemplateDocument<null>,
            RegionDocument<null>,
            RegionBehavior<null>,
            TileDocument<null>,
            TokenDocument<Scene | null>,
            WallDocument<null>,
            Scene,
            User<Actor<null>>,
            EffectsCanvasGroup
        >;
        let canvas: Canvas;
        let game: Game<
            Actor<null>,
            Actors<Actor<null>>,
            ChatMessage,
            Combat,
            Item<null>,
            Macro,
            Scene,
            User
        >;
        let ui: FoundryUI<
            ActorDirectory<Actor<null>>,
            ItemDirectory<Item<null>>,
            ChatLog,
            CompendiumDirectory,
            CombatTracker<Combat | null>,
            Hotbar
        >;
    }

    type AnyFunction = (...args: any) => any;

    interface Config<
        TAmbientLightDocument extends AmbientLightDocument<TScene | null>,
        TActiveEffect extends ActiveEffect<TActor | TItem | null>,
        TActor extends Actor<TTokenDocument | null>,
        TActorDelta extends ActorDelta<TTokenDocument | null>,
        TChatLog extends ChatLog,
        TChatMessage extends ChatMessage,
        TCombat extends Combat,
        TCombatant extends Combatant<TCombat | null, TTokenDocument | null>,
        TCombatTracker extends CombatTracker<TCombat | null>,
        TCompendiumDirectory extends CompendiumDirectory,
        THotbar extends Hotbar,
        TItem extends Item<TActor | null>,
        TMacro extends Macro,
        TMeasuredTemplateDocument extends
            MeasuredTemplateDocument<TScene | null>,
        TRegionDocument extends RegionDocument<TScene | null>,
        TRegionBehavior extends RegionBehavior<TRegionDocument | null>,
        TTileDocument extends TileDocument<TScene | null>,
        TTokenDocument extends TokenDocument<TScene | null>,
        TWallDocument extends WallDocument<TScene | null>,
        TScene extends Scene,
        TUser extends User<Actor<null>>,
        TEffectsCanvasGroup extends EffectsCanvasGroup,
    > {
        time: {
            turnTime: number;
            roundTime: number;
        };
    }

    // Add isSuppressed missing definition
    interface ActiveEffect<TParent extends Actor | Item | null>
        extends ClientBaseActiveEffect<TParent> {
        isSuppressed: boolean;
    }

    interface FoundryUI<
        TActorDirectory extends ActorDirectory<Actor<null>>,
        TItemDirectory extends ItemDirectory<Item<null>>,
        TChatLog extends ChatLog,
        TCompendiumDirectory extends CompendiumDirectory,
        TCombatTracker extends CombatTracker<Combat | null>,
        THotbar extends Hotbar,
    > {
        webrtc: {
            element: JQuery<HTMLElement>;
        };
    }
}
