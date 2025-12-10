// import { useCallback } from "react";
// import { useAdsgram } from "./useAdsgram";

// export function ShowAdButton() {
//   const onReward = useCallback(() => {
//     alert("Reward");
//   }, []);
//   const onError = useCallback((result: any) => {
//     alert(JSON.stringify(result, null, 4));
//   }, []);

//   /**
//    * Вставьте ваш blockId
//    */
//   const showAd = useAdsgram({ blockId: "task-18892", onReward, onError });

//   return (
//     <button className="opacity-50" onClick={showAd}>
//       Show Ad
//     </button>
//   );
// }

// export default ShowAdButton;
