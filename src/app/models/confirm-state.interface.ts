export interface ConfirmState {
    visible: boolean;
    title: string | null;
    message: string | null;
    target?: any;
    confirmLabel?: string | null;
    cancelLabel?: string | null;
}

export function createEmptyConfirmState(): ConfirmState {
    return {
        visible: false,
        title: null,
        message: null,
        target: null,
        confirmLabel: null,
        cancelLabel: null
    };
}