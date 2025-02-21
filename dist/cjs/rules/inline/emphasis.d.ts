import StateInline from "../../fsm/state_inline.js";
declare function emphasis_tokenize(state: StateInline, silent: boolean): boolean;
declare function emphasis_post_process(state: StateInline): void;
declare const _default: {
    tokenize: typeof emphasis_tokenize;
    postProcess: typeof emphasis_post_process;
};
export default _default;
//# sourceMappingURL=emphasis.d.ts.map