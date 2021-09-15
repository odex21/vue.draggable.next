import Sortable, { SortableOptions } from "sortablejs";
import { insertNodeAt, removeNode } from "./util/htmlHelper";
import { console } from "./util/console";
import {
  getComponentAttributes,
  createSortableOption,
  getValidSortableEntries
} from "./core/componentBuilderHelper";
import { computeComponentStructure } from "./core/renderHelper";
import { events } from "./core/sortableEvents";

import {
  h,
  defineComponent,
  nextTick,
  PropType,
  onMounted,
  useContext,
  getCurrentInstance,
  onUpdated,
  onBeforeUnmount,
  computed,
  watch,
  ExtractPropTypes,
  Prop
} from "vue";

let draggingElement = null;

const props = {
  list: {
    type: Array,
    required: false,
    default: null
  },
  modelValue: {
    type: Array,
    required: false,
    default: null
  },
  itemKey: {
    type: [String, Function],
    required: true
  },
  clone: {
    type: Function,
    default: original => {
      return original;
    }
  },
  tag: {
    type: String,
    default: "div"
  },
  move: {
    type: Function,
    default: null
  },
  componentData: {
    type: Object,
    required: false,
    default: null
  },
  sortableOptions: {
    type: Object as PropType<O>,
    required: false,
    default: () => ({})
  }
};

type O = Record<string, any>;

const emits = [
  "update:modelValue",
  "change",
  ...[...events.manageAndEmit, ...events.emit].map(evt => evt.toLowerCase())
];

const draggableComponent = defineComponent<{
  list?: any[];
  modelValue?: any[];
  itemKey: string | Function;
  clone?: Function;
  tag?: string;
  move?: Function;
  componentData?: O;
  sortableOptions?: SortableOptions;
}>({
  name: "draggable",

  inheritAttrs: false,

  props: props as any,

  emits,

  data() {
    this.sortableOptions;
    return {
      error: false
    };
  },

  setup(props, { slots, attrs, emit: $emit, expose }) {
    if (props.list !== null && props.modelValue !== null) {
      console.error(
        "modelValue and list props are mutually exclusive! Please set one or another."
      );
    }
    let _sortable: Sortable;
    let targetDomElement: any;
    let error = false;

    const realList = computed(() => props.list ?? props.modelValue);
    const getKey = computed(() => {
      const { itemKey } = props;
      if (typeof itemKey === "function") {
        return itemKey;
      }
      return element => element[itemKey];
    });

    watch(
      () => attrs,
      newOptionValue => {
        if (!_sortable) return;
        getValidSortableEntries(newOptionValue).forEach(([key, value]) => {
          _sortable.option(key, value);
        });
      },
      {
        deep: true
      }
    );

    let componentStructure: ReturnType<typeof computeComponentStructure>;
    onMounted(() => {
      if (error) return;
      const app = getCurrentInstance();

      componentStructure.updated();

      const sortableOptions = createSortableOption({
        $attrs: Object.assign(props.sortableOptions, attrs),
        callBackBuilder: {
          manageAndEmit: event => manageAndEmit(event),
          emit,
          manage: event => manage(event)
        }
      });

      targetDomElement =
        app.vnode.el.nodeType === 1 ? app.vnode.el : app.vnode.el.parentElement;
      _sortable = new Sortable(targetDomElement, sortableOptions);
      targetDomElement = targetDomElement;
      targetDomElement.__draggable_component__ = app;
    });

    onUpdated(() => {
      componentStructure.updated();
    });

    onBeforeUnmount(() => {
      if (_sortable !== undefined) _sortable.destroy();
    });

    const getUnderlyingVm = domElement =>
      componentStructure.getUnderlyingVm(domElement) || null;

    //TODO check case where you need to see component children
    const getUnderlyingPotencialDraggableComponent = htmElement =>
      htmElement.__draggable_component__;

    const emitChanges = evt => {
      nextTick(() => $emit("change", evt));
    };

    const alterList = onList => {
      if (props.list) {
        onList(props.list);
        return;
      }
      const newList = [...props.modelValue];
      onList(newList);
      $emit("update:modelValue", newList);
    };

    const spliceList = (...args) => {
      const _spliceList = list => list.splice(...args);
      alterList(_spliceList);
    };

    const updatePosition = (oldIndex, newIndex) => {
      const updatePosition = (list: any[]) =>
        list.splice(newIndex, 0, list.splice(oldIndex, 1)[0]);
      alterList(updatePosition);
    };

    const getRelatedContextFromMoveEvent = ({ to, related }) => {
      const component = getUnderlyingPotencialDraggableComponent(to);
      if (!component) {
        return { component };
      }
      const list = component.realList;
      const context = { list, component };
      if (to !== related && list) {
        const destination = component.getUnderlyingVm(related) || {};
        return { ...destination, ...context };
      }
      return context;
    };

    const getVmIndexFromDomIndex = domIndex => {
      return componentStructure.getVmIndexFromDomIndex(
        domIndex,
        targetDomElement
      );
    };

    let context: any;
    const onDragStart = evt => {
      context = getUnderlyingVm(evt.item);
      evt.item._underlying_vm_ = props.clone(context.element);
      draggingElement = evt.item;
    };

    const onDragAdd = evt => {
      const element = evt.item._underlying_vm_;
      if (element === undefined) {
        return;
      }
      removeNode(evt.item);
      const newIndex = getVmIndexFromDomIndex(evt.newIndex);
      spliceList(newIndex, 0, element);
      const added = { element, newIndex };
      emitChanges({ added });
    };

    const onDragRemove = evt => {
      insertNodeAt(targetDomElement, evt.item, evt.oldIndex);
      if (evt.pullMode === "clone") {
        removeNode(evt.clone);
        return;
      }
      const { index: oldIndex, element } = context;
      spliceList(oldIndex, 1);
      const removed = { element, oldIndex };
      emitChanges({ removed });
    };

    const onDragUpdate = evt => {
      removeNode(evt.item);
      insertNodeAt(evt.from, evt.item, evt.oldIndex);
      const oldIndex = context.index;
      const newIndex = getVmIndexFromDomIndex(evt.newIndex);
      updatePosition(oldIndex, newIndex);
      const moved = { element: context.element, oldIndex, newIndex };
      emitChanges({ moved });
    };

    const computeFutureIndex = (relatedContext, evt) => {
      if (!relatedContext.element) {
        return 0;
      }
      const domChildren = [...evt.to.children].filter(
        el => el.style["display"] !== "none"
      );
      const currentDomIndex = domChildren.indexOf(evt.related);
      const currentIndex = relatedContext.component.getVmIndexFromDomIndex(
        currentDomIndex
      );
      const draggedInList = domChildren.indexOf(draggingElement) !== -1;
      return draggedInList || !evt.willInsertAfter
        ? currentIndex
        : currentIndex + 1;
    };

    const onDragMove = (evt, originalEvent) => {
      const { move } = props;
      if (!move || !realList.value) {
        return true;
      }

      const relatedContext = getRelatedContextFromMoveEvent(evt);
      const futureIndex = computeFutureIndex(relatedContext, evt);
      const draggedContext = {
        ...context,
        futureIndex
      };
      const sendEvent = {
        ...evt,
        relatedContext,
        draggedContext
      };
      return move(sendEvent, originalEvent);
    };

    const onDragEnd = () => {
      draggingElement = null;
    };

    const handlerMap = {
      onDragStart,
      onDragAdd,
      onDragRemove,
      onDragUpdate,
      onDragMove,
      onDragEnd
    };

    function emit(evtName, evtData) {
      nextTick(() => $emit(evtName.toLowerCase(), evtData));
    }

    function manage(evtName) {
      return (evtData, originalElement) => {
        if (realList.value !== null) {
          return handlerMap[`onDrag${evtName}`](evtData, originalElement);
        }
      };
    }

    function manageAndEmit(evtName) {
      const delegateCallBack = manage(evtName);
      return (evtData, originalElement) => {
        delegateCallBack(evtData, originalElement);
        emit(evtName, evtData);
      };
    }

    return () => {
      try {
        error = false;
        const { tag, componentData } = props;
        componentStructure = computeComponentStructure({
          $slots: slots,
          tag,
          realList: realList.value,
          getKey: getKey.value
        });
        const attributes = getComponentAttributes({
          $attrs: attrs,
          componentData
        });
        return componentStructure.render(h, attributes);
      } catch (err) {
        error = true;
        return h(
          "pre",
          {
            style: {
              color: "red"
            }
          },
          err.stack
        );
      }
    };
  }
});

export default draggableComponent;
