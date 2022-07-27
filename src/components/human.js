import "./style.css";
import { useEffect, useState } from "react";

export default function Human() {
  const [bodyState, setBodyState] = useState({
    head: {
      show: true,
      selected: true
    },
    left_shoulder: {
      show: true,
      selected: true
    },
    right_shoulder: {
      show: true,
      selected: true
    },
    left_arm: {
      show: true,
      selected: true
    },
    right_arm: {
      show: true,
      selected: true
    },
    chest: {
      show: true,
      selected: true
    },
    stomach: {
      show: true,
      selected: true
    },
    left_leg: {
      show: true,
      selected: true
    },
    right_leg: {
      show: true,
      selected: true
    },
    left_hand: {
      show: true,
      selected: true
    },
    right_hand: {
      show: true,
      selected: true
    },
    left_foot: {
      show: true,
      selected: true
    },
    right_foot: {
      show: true,
      selected: true
    }
  });

//   useEffect(() => {
//     window.alert(JSON.stringify(bodyState.head));
//   }, [bodyState]);

//   console.log(bodyState);
//   return (
//     <div className="human">
//       <h1>Hello CodeSandbox</h1>
//       <h2>Start editing to see some magic happen!</h2>
//       <div>
//         <BodyComponent partsInput={bodyState} />
//       </div>
//     </div>
//   );
}
