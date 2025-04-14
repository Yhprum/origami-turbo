import { deepCopy } from "~/lib/utils";

export type MutatorCallback<T> = (callback: ((data: T) => T) | T) => void;

export function setModifiedResponse<T extends { id: number }>(
  data: T,
  itemToModify: number,
  setData: MutatorCallback<Array<T>>
) {
  setData((oldData) => {
    const newData = deepCopy(oldData);
    const holdingIndex = newData.findIndex((item) => item.id === itemToModify);
    newData[holdingIndex] = data;
    return newData;
  });
}

export function deleteItem<T extends { id: number }>(
  itemToDelete: number,
  setData: MutatorCallback<Array<T>>
) {
  setData((data) => deepCopy(data).filter((h) => h.id !== itemToDelete));
}

export function setModifiedField<T extends { id: number }, K extends keyof T>(
  field: K,
  value: T[K],
  itemToModify: number,
  setData: MutatorCallback<Array<T>>
) {
  setData((data) => {
    const newData = deepCopy(data);
    const holdingIndex = newData.findIndex((item) => item.id === itemToModify);
    newData[holdingIndex][field] = value;
    return newData;
  });
}
