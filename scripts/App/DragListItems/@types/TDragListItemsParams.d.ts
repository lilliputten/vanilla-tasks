interface TDragListItemsResult {
  dragId: string;
  targetId: TItemId;
  sourceId: TItemId;
  insertAfter: boolean;
}

interface TDragListItemsParams {
  dragId: string;
  listNode: HTMLElement;
  onDragFinish: (params: TDragListItemsResult) => void;
}
