import React from "react";

// 하위 요소에 state 를 쉽게 넘겨주기 위한 state 유틸리티입니다.
//
// const [checked, setChecked] = useState();
// return <MyComponent value={checked} setValue={setChecked}/>
//
// 와 같이 state 와 state 를 설정하는 함수를 모두 하위 컴포넌트에 넘겨주기 보다,
//
// const checked = usePassState();
// return <MyComponent value={checked}/>
//
// 와 같은 형태로 한번에 state 를 넘겨줄 수 있습니다.
// 해당 상황에서 checked 는 checked.value 와 checked.update 를 가지게 됩니다.
// 즉, [checked, setChecked] 를 하나로 묶어놓은 형태가 됩니다.
//
// 단, checked.value 는 항상 최신으로 유지됨에 유의하세요
// **값을 넘겨받은것이 아니라, 값이 들어있는 레퍼런스를 넘겨받은것입니다.**
// 따라서 checked.value 필드를 읽을 때 마다 해당 값은 항상 최신 상태를 유지합니다
//
// 또한, useEffect 와 사용할 때 다음과 같은 방법으로 값이 변경됨을 추적할 수 있습니다
// useEffect( ()=>{}, [ checked.value ] ); // checked 가 변경 될 때 마다 effect 수행
//
// ## PassState 에 대한 유틸
//
// 만약 인자로 PassState<boolean> | boolean 을 받았다고 하면 아래와 같은 도구가 도움이 됩니다
//
// unwrap, 포장을 푸는것 처럼 pass state 를 받은 경우 속 내용을 리턴하고, 그렇지 않은 경우
// 받은 값을 그대로 리턴합니다
// PassState.unwrap<T>( state: PassState<T> | T ): T
//
// state 가 pass state 인지 확인합니다. 만약 pass state 인 경우 안전하게 cast 할 수 있습니다
// 즉, 만약 외부에서 checked: PassState<boolean> | boolean 라는 입력을 받은 경우
// if (PassState.isPassState( checked )) {
//   (checked as PassState<boolean>).update( true );
// }
// 와 같이 받은것이 boolean 인지, PassState<boolean> 인지 확인 후 PassState<boolean> 인 경우만
// update 를 수행할 수 있습니다.
// 해당 방식으로 CheckBox 를 구현한다 가정할 때, 만약 checked 가 절대 바뀔 일 없다면
// checked={true} 를 입력해줄 수 있고, 바뀌어야한다면 checked={state} 를 넣어 줄 수 있게됩니다.
// PassState.isPassState( state: any ): boolean
//
// wrap 을 이용하면 특정 값을 PassState 로 묶고 update 함수를 지정할 수 있습니다.
// 예를 들어 로직에 의해 직접적으로 처리되는 PassState 를 만들고 싶은 경우
// PassState.wrap(10, (newValue) => console.log(newValue)) 를 하는 경우
// 값이 10 이며 새로운 값이 들어올 때 새로운 값이 출력되는 PassState 가 만들어집니다.
// 단 newValue 는 다른 state 에 저장되는 방식으로 렌더링을 트리거해야합니다
//
// ## value 조건 검사 도구
//
// 편의를 위해 value 를 검사하는 도구가 존재합니다
// PassState<string> 에 대해서 minLengthError, maxLengthError, regexError
// 등의 연산이 존재합니다. 예를 들어
// PassState<string>.minLengthError( expectLength: number, message: string ): string|null
// 의 경우 value 의 길이가 expectLength 를 넘지 못하면 message 를 반환, 넘으면 null 을 반환합니다.
//
// 이를 통해 Textbox 를 구현하였다고 하고, text: PassState<string>, error?: string 의 입력을
// 받는다고 가정하면
// <Textbox
//   text={state}
//   error={
//     state.minLengthError(4, "최소 길이는 4 입니다")
//     ?? state.maxLengthError(10, "최대 길이는 5 입니다")
//     ?? state.regexError(/^\d$/, "숫자로만 구성되어야합니다")
//   }
// />
// 다음과 같이 입력할 경우 error 는 모든 조건을 만족할 때 null, 조건을 만족하지 않은 경우
// 부합하지 못한 첫 조건의 메시지가 됩니다. 따라서 Textbox 구현에서는 error 가 null 이
// 아니라면 오류로 간주하고 error 를 표시할 수 있게됩니다.
export namespace PassState {
  export class PassStateImpl<T> {
    update: React.Dispatch<React.SetStateAction<T>>;
    value: T;

    constructor(value: T, update: React.Dispatch<React.SetStateAction<T>>) {
      this.value = value;
      this.update = update;
    }

    falsyError(message: string): string | null {
      return this.value ? null : message;
    }
    regexError(
      this: PassState<string>,
      expectRegex: RegExp,
      message: string,
    ): string | null {
      if (!this.value) return message;
      if (this.value.match(expectRegex)) return null;
      return message;
    }
    minLengthError(
      this: PassState<string>,
      expectLength: number,
      message: string,
    ): string | null {
      if (!this.value) return message;
      if (this.value.length < expectLength) return message;
      return null;
    }
    maxLengthError(
      this: PassState<string>,
      expectLength: number,
      message: string,
    ): string | null {
      if (!this.value) return message;
      if (this.value.length > expectLength) return message;
      return null;
    }
    emptyError(this: PassState<string>, message: string): string | null {
      if (this.value == "") return message;
      if (!this.value) return message;
      return null;
    }
  }

  // React hook
  export function use<T>(initval: T | (() => T), deps?: any[]): PassState<T> {
    "use client";

    const [value, setValue] = React.useState(initval);
    const refed = React.useRef(null as PassState<T> | null);

    refed.current ??= new PassStateImpl(
      value,
      setValue,
    ) as unknown as PassState<T>;
    refed.current.value = value;

    // React.useEffect(()=>{ setValue(initval) }, [initval]);
    React.useEffect(() => {
      setValue(initval);
    }, deps ?? []);

    return refed.current;
  }

  // Utility functions
  export function isPassState<T>(
    obj: T,
  ): T extends PassState<any> ? true : false {
    if (typeof obj !== "object") return false as any;
    return (obj instanceof PassStateImpl) as any;
  }
  export function unwrap<T>(obj: PassState<T> | T): T {
    if (isPassState(obj)) return (obj as PassState<T>).value;
    return obj as T;
  }
  export function wrap<T>(
    value: T,
    setValue: (newValue: T) => void,
  ): PassState<T> {
    const wrapped = new PassStateImpl(value, (i: T | ((input: T) => T)) => {
      if (typeof i === "function") {
        setValue((i as any)(value) as any);
      } else {
        setValue(i);
      }
    });
    return wrapped as unknown as PassState<T>;
  }

  // Base type
  export type PassStateNumber<T extends number> = {
    minError(
      this: PassState<T>,
      expect: number,
      message: string,
    ): string | null;
    maxError(
      this: PassState<T>,
      expect: number,
      message: string,
    ): string | null;
  };
  export type PassStateString<T extends string | null> = {
    /** Regex match 가 성공하지 못하면 오류를 발생시킵니다 */
    regexError(
      this: PassState<T>,
      expectRegex: RegExp,
      message: string,
    ): string | null;
    /** 길이가 부족하면 오류를 발생시킵니다 */
    minLengthError(
      this: PassState<T>,
      expectLength: number,
      message: string,
    ): string | null;
    /** 길이가 초과하면 오류를 발생시킵니다 */
    maxLengthError(
      this: PassState<T>,
      expectLength: number,
      message: string,
    ): string | null;
    /** 문자열이 비어있으면 오류를 발생시킵니다 */
    emptyError(this: PassState<T>, message: string): string | null;
  };
  export type PassStateAny<T> = {
    /** 값을 업데이트 시킵니다. 상태가 생성된 렌더링 컨텍스트 부터 업데이트가 시작됩니다 */
    update: React.Dispatch<React.SetStateAction<T>>;
    /** 이 상태가 가지는 값입니다. 상위에서 받았거나 현재 컨텍스트가 생성했다면 useEffect 를 통해 변경을 추적할 수 있습니다. */
    value: T;
    /** 거짓으로 평가되는 값이면 오류를 발생시킵니다. 문자열이면 비어있어도 발생합니다 */
    falsyError(this: PassState<T>, message: string): string | null;
  };
}
export type PassState<T> = (T extends number
  ? PassState.PassStateNumber<T>
  : object) &
  (T extends string | null
    ? T extends null
      ? object
      : PassState.PassStateString<T>
    : object) &
  PassState.PassStateAny<T>;
