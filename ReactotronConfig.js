import AsyncStorage from "@react-native-async-storage/async-storage";
import Reactotron, { asyncStorage } from "reactotron-react-native";

Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({
    name: "React Native Demo",
  })
  .useReactNative({
    asyncStorage: true, // there are more options to the async storage.
    networking: {
      // optionally, you can turn it off with false.
      ignoreUrls: /symbolicate/,
    },
    editor: false, // there are more options to editor
    errors: { veto: (stackFrame) => false }, // or turn it off with false
    overlay: false, // just turning off overlay
  })
  .use(asyncStorage())
  .connect();


Reactotron.onCustomCommand('show_async_storage', async () => {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  const storageObject = items.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  Reactotron.log(`AsyncStorage content:\n${JSON.stringify(storageObject, null, 2)}`);
});
