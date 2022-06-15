
/**
 * @param {MessageEvent<Array>}  event - A string param.
 * @returns {void} This is the result
 */
const handleMessage = (event) => {
  const { newSortedArray, droppedLocationId, draggedData, data, draggedId } = event.data;
  const indexOfDropped = newSortedArray.findIndex((item) => item.key === droppedLocationId);
  const itemsUpToDropped = newSortedArray.slice(0, indexOfDropped);
  const itemsAfterDropped = newSortedArray.slice(indexOfDropped);
  const changedOrder = [...itemsUpToDropped, { key: draggedId, ...draggedData }, ...itemsAfterDropped];
  const newData = { ...data };
  changedOrder.forEach((item, index) => {
    newData[item.key].order = index;
  });
  self.postMessage(newData);
}

self.addEventListener("message", handleMessage);
