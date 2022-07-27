import React, { useState } from "react";
import styled from "styled-components";
import image from './body.png';

// import './BodyComponent.css'

const Wrapper = styled.div`
& {
  width: 250px;
  position: relative;
  padding-top: 10px;
  height: 250px;
  display: block;
  margin: 40px auto;
}

& svg:hover {
  cursor: pointer;
}

& svg:hover path {
  fill: #EE4B2B;
}
& svg.selected path {
  fill: #F88379;
}

& svg {
  position: absolute;
  left: 50%;
  fill: #E3735E;
}

& svg#head {
  margin-left: -25.4px;
  top: -5px;
}

& svg#left_shoulder {
  margin-left: -50px;
  top: 58px;
}
& svg#right_shoulder {
  margin-left: 13.5px;
  top: 58px;
}
& svg#left_arm {
  margin-left: -66.7px;
  top: 109px;
}
& svg#right_arm {
  margin-left: 36.5px;
  top: 109px;
  z-index: 10001;
}
& svg#chest {
  margin-left: -15.5px;
  top: 20px;
}
& svg#stomach {
  margin-left: -9.5px;
  top: 38px;
}

& svg#left_leg {
  margin-left: -25.4px;
  top: 120px;
  z-index: 9999;
}

& svg#right_leg {
  margin-left: -26.5px;
  top: 215px;
  z-index: 9999;
}

& svg#left_hand {
  margin-left: -17.5px;
  top: 1px;
}

& svg#right_hand {
  margin-left: -30px;
  top: -6px;
}

& svg#left_foot {
  margin-left: -35.5px;
  top: 455px;
}

& svg#right_foot {
  margin-left: 5.5px;
  top: 455px;
}
`;

export const SVG_PARTS: any = ['head', 'left_shoulder', 'right_shoulder', 'left_arm',
  'right_arm', 'chest', 'stomach', 'left_leg', 'right_leg', 'left_hand', 'right_hand',
  'left_foot', 'right_foot']

export const PARTS_GROUPS: any = {
  head: { 'head': true },
  trunk: {
    'left_shoulder': true, 'right_shoulder': true,
    'left_arm': true, 'right_arm': true,
    'chest': true, 'stomach': true
  },
  legs: { 'left_leg': true, 'right_leg': true },
  hands: { 'right_hand': true, 'left_hand': true },
  foots: { 'left_foot': true, 'right_foot': true }
}

export interface BodyComponentProps {
  onClick?: Function
  onChange?: Function
  partsInput?: any
}

export const BodyComponent: React.FC<BodyComponentProps> = ({ onClick, onChange, partsInput = {} }) => {

  const [parts, setParts] = useState(partsInput)
  const onClickSvg = ({ target }: any) => {
    const id = target.id || target.parentElement.id
    const newParts = { ...parts }

    if (newParts[id] === true || newParts[id] === false) {
      newParts[id] = !newParts[id]
    } else if (newParts[id]) {
      newParts[id].selected = !newParts[id].selected
    } else {
      newParts[id] = { selected: true }
    }

    setParts(newParts)
    if (onChange) onChange(newParts)
    if (onClick) onClick(id)
  }

  const svgElements: any = {
    //head
    'head': (selected: boolean) => <svg onClick={onClickSvg} data-position="head" key="head" id="head" className={(selected ? 'selected ' : '') + "head"} xmlns="http://www.w3.org/2000/svg" width="56.594" height="60" viewBox="0 0 56.594 60"><path d="M24.5 1C35.2696 1 44 9.73045 44 20.5L43.833 25.5109C46.4391 25.6823 48.5 27.8505 48.5 30.5V31.5C48.5 35.0528 46.184 38.0647 42.9794 39.1084C41.6758 43.9798 38.0303 49.5865 33.25 52.9584C30.6114 54.8197 27.627 56 24.5 56C21.373 56 18.3886 54.8197 15.75 52.9584C10.9697 49.5865 7.32415 43.9798 6.0206 39.1084C2.81599 38.0647 0.5 35.0528 0.5 31.5V30.5C0.5 27.8505 2.56085 25.6823 5.16703 25.5109L5 20.5C5 9.73045 13.7304 1 24.5 1Z" fill="#A4DDED" stroke="white" stroke-linecap="round" stroke-linejoin="round" /></svg>,
    //l arm
    'left_shoulder': (selected: boolean) => <svg onClick={onClickSvg} data-position="left_shoulder" key="left_shoulder" id="left_shoulder" className={(selected ? 'selected ' : '') + "left_shoulder"} xmlns="http://www.w3.org/2000/svg" width="40" height="100" viewBox="0 0 40 100">
    <path d="M33.25 0.5C31.75 1 25.75 0.5 21.5 4.75C17.25 9 17 14.5 16.25 17.5C15.5001 20.5 13.25 28.5 12 30.75C10.75 33 8.5 36 7 38.75C5.5 41.5 1.5 52.5 1 53.25L10.75 60C11 59.25 18.5 49.25 20.5 46C22.5 42.75 23.5 39.5 24.5 37.5C25.5 35.5 31 27.25 31 27.25L33.25 0.5Z" fill="#A4DDED" stroke="white" stroke-linecap="round" stroke-linejoin="round"/></svg>,
    //r arm
    'right_shoulder': (selected: boolean) => <svg onClick={onClickSvg} data-position="right_shoulder" key="right_shoulder" id="right_shoulder" className={(selected ? 'selected ' : '') + "right_shoulder"} xmlns="http://www.w3.org/2000/svg" width="40" height="100" viewBox="0 0 40 100"><path d="M0.75 0.5C2.25 1 8.24999 0.5 12.5 4.75C16.75 9 17 14.5 17.75 17.5C18.5 20.5 20.75 28.5 22 30.75C23.25 33 25.5 36 27 38.75C28.5 41.5 32.5 52.5 33 53.25L23.25 60C23 59.25 15.5 49.25 13.5 46C11.5 42.75 10.5 39.5 9.50002 37.5C8.50002 35.5 3 27.25 3 27.25L0.75 0.5Z" fill="#A4DDED" stroke="white" stroke-linecap="round" stroke-linejoin="round" /></svg>,
    //l hand
    'left_arm': (selected: boolean) => <svg onClick={onClickSvg} data-position="left_arm" key="left_arm" id="left_arm" className={(selected ? 'selected ' : '') + "left_arm"} xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M26.5 14.75C26.75 13.25 26.5 8.75 26.75 8L17 1.25C16.5 2 11.25 4.75 10 6.5C8.75 8.25 8.25 9.75 7.25 10.75C6.25 11.75 5.5 12.75 4.25 13.75C3 14.75 1 16.75 1 17.5C1 18.25 3.5 20 6 18.75C8.5 17.5 10.25 15.25 10.25 15.25C10.25 15.25 7.25 20.75 6.75 22.75C6.25 24.75 5.5 31.75 5.5 31.75C5.5 31.75 6.5 32.75 7.25 32.75C8 32.75 9.25 32.5 10.25 31.25C11.25 30 11.75 25.5 12.25 24.5C12.75 23.5 14.5 21.75 14.5 21.75C14.5 21.75 15 29.75 15.5 30.5C16 31.25 17.5 32.75 19.75 32.25C22 31.75 24 29.25 24.75 28.25C25.5 27.25 25.75 25.75 25.5 24.25C25.25 22.75 25 19.5 25 18.75C25 18 26.25 16.25 26.5 14.75Z" fill="#A4DDED" /></svg>,
    //r hand
    'right_arm': (selected: boolean) => <svg onClick={onClickSvg} data-position="right_arm" key="right_arm" id="right_arm" className={(selected ? 'selected ' : '') + "right_arm"} xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M1.5 14.75C1.25 13.25 1.5 8.75 1.25 8L11 1.25C11.5 2 16.75 4.75 18 6.5C19.25 8.25 19.75 9.75 20.75 10.75C21.75 11.75 22.5 12.75 23.75 13.75C25 14.75 27 16.75 27 17.5C27 18.25 24.5 20 22 18.75C19.5 17.5 17.75 15.25 17.75 15.25C17.75 15.25 20.75 20.75 21.25 22.75C21.75 24.75 22.5 31.75 22.5 31.75C22.5 31.75 21.5 32.75 20.75 32.75C20 32.75 18.75 32.5 17.75 31.25C16.75 30 16.25 25.5 15.75 24.5C15.25 23.5 13.5 21.75 13.5 21.75C13.5 21.75 13 29.75 12.5 30.5C12 31.25 10.5 32.75 8.25 32.25C6 31.75 4 29.25 3.25 28.25C2.5 27.25 2.25 25.75 2.5 24.25C2.75 22.75 3 19.5 3 18.75C3 18 1.75 16.25 1.5 14.75Z" fill="#A4DDED" /></svg>,
    //facial expressions
    'left_hand': (selected: boolean) => <svg onClick={onClickSvg} data-position="left_hand" key="left_hand" id="left_hand" className={(selected ? 'selected ' : '') + "left_hand"} xmlns="http://www.w3.org/2000/svg" width="35" height="60" viewBox="0 0 35 60"><path d="M16.5 0.5C25.8888 0.5 32.5 8.11116 32.5 17.5L32.3544 21.8685L32.0641 30.5769C32.0641 31.5513 31.9066 32.6152 31.6102 33.7227C30.4738 37.9696 28.2956 41.8575 24.1282 44.7971C21.8279 46.4197 19.2261 47.4487 16.5 47.4487C13.7739 47.4487 11.1721 46.4197 8.87182 44.7971C4.70436 41.8575 2.52618 37.9696 1.38975 33.7227C1.0934 32.6152 0.935897 31.5513 0.935897 30.5769L0.645616 21.8685L0.5 17.5C0.5 8.11116 7.11116 0.5 16.5 0.5Z" fill="#A4DDED" stroke="white" stroke-linecap="round" stroke-linejoin="round" /></svg>,
    //eyes
    'chest': (selected: boolean) => <svg onClick={onClickSvg} data-position="chest" key="chest" id="chest" className={(selected ? 'selected ' : '') + "chest"} xmlns="http://www.w3.org/2000/svg" width="30" height="10" viewBox="0 0 30 10"><path d="M7 1.49986C5.25 1.24986 0.5 3.49986 0.5 3.49986C0.5 3.49986 3.53086 7.34345 5.5 7.99983C8.5 8.99983 12 5.49986 12 5.49986C12 5.49986 8.75 1.74986 7 1.49986Z M22 1.49986C23.75 1.24986 28.5 3.49986 28.5 3.49986C28.5 3.49986 25.4691 7.34345 23.5 7.99983C20.5 8.99983 17 5.49986 17 5.49986C17 5.49986 20.25 1.74986 22 1.49986Z" fill="#A4DDED" stroke="white" /></svg>,
    //voice
    'stomach': (selected: boolean) => <svg onClick={onClickSvg} data-position="stomach" key="stomach" id="stomach" className={(selected ? 'selected ' : '') + "stomach"} xmlns="http://www.w3.org/2000/svg" width="20" height="10" viewBox="0 0 20 10"><path d="M8.5 5C5.5 5 0.5 1.25 0.5 1.25C0.5 1.25 6.5 0.499996 8.5 0.499996C10.5 0.499996 16.5 1.25 16.5 1.25C16.5 1.25 11.5 5 8.5 5Z" fill="#A4DDED" fill-opacity="0.35" stroke="white" stroke-linecap="round" stroke-linejoin="round" /></svg>,
    //legs
    'left_leg': (selected: boolean) => <svg onClick={onClickSvg} data-position="left_leg" key="left_leg" id="left_leg" className={(selected ? 'selected ' : '') + "left_leg"} xmlns="http://www.w3.org/2000/svg" width="60" height="120" viewBox="0 0 60 120"><path d="M1.74998 28.5C0.749977 20.5 0.75003 8.99999 1.75 0.999992L22.5 9.99999C22.5 9.99999 24.5 13.25 24.5 29.25V61.25C24.5 62.8241 24.3451 64.7854 24.1573 67.1643C23.8678 70.8305 23.5 75.4885 23.5 81.25C23.5 87.0115 23.8678 90.9339 24.1573 94.0211C24.1888 94.3568 24.2193 94.6827 24.2484 95H8.75C8.74999 94.1343 7.95379 89.1472 7.03036 83.363C5.82032 75.7837 4.39181 66.8358 4.25 64C4.07414 60.4831 4.39305 56.1005 4.59771 53.2879C4.68402 52.1018 4.75001 51.1949 4.75 50.75C4.74999 49.926 4.14652 45.7076 3.43682 40.7466C2.85451 36.6761 2.20068 32.1056 1.74998 28.5Z M47.2499 0.999992C48.2499 8.99999 48.25 20.5 47.25 28.5C46.7993 32.1056 46.1454 36.6761 45.5631 40.7466C44.8534 45.7076 44.25 49.926 44.2499 50.75C44.2499 51.1949 44.3159 52.1018 44.4022 53.2879C44.6069 56.1005 44.9258 60.4831 44.7499 64C44.6081 66.8358 43.1796 75.7837 41.9696 83.363C41.0462 89.1472 40.25 94.1343 40.2499 95H24.7516C24.7806 94.6827 24.8112 94.3568 24.8427 94.0211C25.1322 90.9339 25.5 87.0115 25.5 81.25C25.5 75.4885 25.1322 70.8305 24.8427 67.1643C24.6548 64.7854 24.5 62.8241 24.5 61.25V29.25C24.5 13.25 26.5 9.99999 26.5 9.99999L47.2499 0.999992Z" fill="#A4DDED" /></svg>,
    //feet
    'right_leg': (selected: boolean) => <svg onClick={onClickSvg} data-position="right_leg" key="right_leg" id="right_leg" className={(selected ? 'selected ' : '') + "right_leg"} xmlns="http://www.w3.org/2000/svg" width="50" height="40" viewBox="0 0 50 40"><path d="M25.2484 1H9.74999C9.75002 3 5.74997 10.25 4.74999 11.25C4.34033 11.6597 3.67889 12.1113 3.00635 12.5705C2.03727 13.2322 1.04514 13.9097 0.749994 14.5C0.250021 15.5 0.499967 17.5 1.49999 18C2.50002 18.5 21.2499 19.5 22.75 19.5C24.25 19.5 25.5 18.25 25.5 18.25V5.25C25.5 3.93971 25.3927 2.57577 25.2484 1Z M41.2499 1H25.7516C25.6073 2.57577 25.5 3.93971 25.5 5.25V18.25C25.5 18.25 26.7499 19.5 28.25 19.5C29.75 19.5 48.4999 18.5 49.4999 18C50.5 17.5 50.7499 15.5 50.2499 14.5C49.9548 13.9097 48.9627 13.2322 47.9936 12.5705C47.321 12.1113 46.6596 11.6597 46.2499 11.25C45.25 10.25 41.2499 3 41.2499 1Z" fill="#A4DDED" /></svg>,
    // 'left_hand': (selected: boolean) => <svg onClick={onClickSvg} data-position="left_hand" key="left_hand" id="left_hand" className={(selected ? 'selected ' : '') + "left_hand"} xmlns="http://www.w3.org/2000/svg" width="90" height="38.938" viewBox="0 0 90 38.938"><path d="m 21.255,-0.00198191 2.88,6.90000201 8.412,1.335 0.664,12.4579799 -4.427,17.8 -2.878,-0.22 2.8,-11.847 -2.99,-0.084 -4.676,12.6 -3.544,-0.446 4.4,-12.736 -3.072,-0.584 -5.978,13.543 -4.428,-0.445 6.088,-14.1 -2.1,-1.25 L 4.878,34.934 1.114,34.489 12.4,12.9 11.293,11.12 0.665,15.57 0,13.124 8.635,5.3380201 Z" /></svg>,
    // 'right_hand': (selected: boolean) => <svg onClick={onClickSvg} data-position="right_hand" key="right_hand" id="right_hand" className={(selected ? 'selected ' : '') + "right_hand"} xmlns="http://www.w3.org/2000/svg" width="90" height="38.938" viewBox="0 0 90 38.938"><path d="m 13.793386,-0.00198533 -2.88,6.90000163 -8.4120002,1.335 -0.664,12.4579837 4.427,17.8 2.878,-0.22 -2.8,-11.847 2.99,-0.084 4.6760002,12.6 3.544,-0.446 -4.4,-12.736 3.072,-0.584 5.978,13.543 4.428,-0.445 -6.088,-14.1 2.1,-1.25 7.528,12.012 3.764,-0.445 -11.286,-21.589 1.107,-1.78 10.628,4.45 0.665,-2.447 -8.635,-7.7859837 z" /></svg>,
    // 'left_foot': (selected: boolean) => <svg onClick={onClickSvg} data-position="left_foot" key="left_foot" id="left_foot" className={(selected ? 'selected ' : '') + "left_foot"} xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><path d="m 19.558357,1.92821 c -22.1993328,20.55867 -11.0996668,10.27933 0,0 z m 5.975,5.989 -0.664,18.415 -1.55,6.435 -4.647,0 -1.327,-4.437 -1.55,-0.222 0.332,4.437 -5.864,-1.778 -1.5499998,-0.887 -6.64,-1.442 -0.22,-5.214 6.418,-10.87 4.4259998,-5.548 c 9.991542,-3.26362 9.41586,-8.41457 12.836,1.111 z" /></svg>,
    // 'right_foot': (selected: boolean) => <svg onClick={onClickSvg} data-position="right_foot" key="right_foot" id="right_foot" className={(selected ? 'selected ' : '') + "right_foot"} xmlns="http://www.w3.org/2000/svg" width="90" height="38.938" viewBox="0 0 90 38.938"><path d="m 11.723492,2.35897 c -40.202667,20.558 -20.1013335,10.279 0,0 z m -5.9740005,5.989 0.663,18.415 1.546,6.435 4.6480005,0 1.328,-4.437 1.55,-0.222 -0.333,4.437 5.863,-1.778 1.55,-0.887 6.638,-1.442 0.222,-5.214 -6.418,-10.868 -4.426,-5.547 -10.8440005,-4.437 z" /> </svg>
  }

  return (
    <div>
      <div className="Outline">
        <img  src={image} alt="fireSpot"/>
      </div>
      <Wrapper className="human-body">
        {Object.keys(svgElements)
          .filter(part => !parts[part] || parts[part].show !== false)
          .map((part: string) => {
            let selected = false
            if (parts[part]) selected = parts[part].selected
            return svgElements[part](selected)
          })}
      </Wrapper>
    </div>
  )
}
