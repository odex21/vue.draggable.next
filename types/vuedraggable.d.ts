import Sortable from 'sortablejs';
import { PropType } from 'vue';
declare const draggableComponent: import("vue").DefineComponent<{
    list: {
        type: ArrayConstructor;
        required: boolean;
        default: any;
    };
    modelValue: {
        type: ArrayConstructor;
        required: boolean;
        default: any;
    };
    itemKey: {
        type: (FunctionConstructor | StringConstructor)[];
        required: boolean;
    };
    clone: {
        type: FunctionConstructor;
        default: (original: any) => any;
    };
    tag: {
        type: StringConstructor;
        default: string;
    };
    move: {
        type: FunctionConstructor;
        default: any;
    };
    componentData: {
        type: ObjectConstructor;
        required: boolean;
        default: any;
    };
    sortableOptions: {
        type: PropType<Sortable.SortableOptions>;
        required: boolean;
        default: () => {};
    };
}, () => any, {
    error: boolean;
}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, string[], string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    clone: Function;
    tag: string;
    sortableOptions: {};
} & {
    move?: Function;
    componentData?: Record<string, any>;
    list?: unknown[];
    modelValue?: unknown[];
    itemKey?: string | Function;
}>, {
    move: Function;
    clone: Function;
    componentData: Record<string, any>;
    tag: string;
    list: unknown[];
    modelValue: unknown[];
    sortableOptions: {};
}>;
export default draggableComponent;
