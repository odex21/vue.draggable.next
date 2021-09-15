import Sortable, { SortableOptions } from "sortablejs";
declare type O = Record<string, any>;
declare const draggableComponent: import("vue").DefineComponent<{
    list?: any[];
    modelValue?: any[];
    itemKey: string | Function;
    clone?: Function;
    tag?: string;
    move?: Function;
    componentData?: O;
    sortableOptions?: SortableOptions;
}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, import("vue").EmitsOptions, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{} & {
    list?: unknown;
    modelValue?: unknown;
    itemKey?: string | Function;
    clone?: Function;
    tag?: string;
    move?: Function;
    componentData?: unknown;
    sortableOptions?: Sortable.SortableOptions;
}>, {}>;
export default draggableComponent;
