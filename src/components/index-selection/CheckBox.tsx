
function CheckBox() {
  return (
    <div>
      {/* 브랜드별 */}
      <fieldset>
        <legend>브랜드별</legend>
        <label>
          <input type="checkbox" /> 갤럭시북5 프로
        </label>
        <label>
          <input type="checkbox" /> 2025 그램 프로16
        </label>
        <label>
          <input type="checkbox" /> 아이디어패드
        </label>
        <label>
          <input type="checkbox" /> GF시리즈
        </label>
        <label>
          <input type="checkbox" /> 오픈
        </label>
      </fieldset>

      {/* 화면 크기대 */}
      <fieldset>
        <legend>화면 크기대</legend>
        <label>
          <input type="checkbox" /> 14인치대
        </label>
        <label>
          <input type="checkbox" /> 15인치대
        </label>
        <label>
          <input type="checkbox" /> 16인치대
        </label>
        <label>
          <input type="checkbox" /> 17인치대
        </label>
        <label>
          <input type="checkbox" /> 18인치 이상
        </label>
      </fieldset>

      {/* CPU 종류 */}
      <fieldset>
        <legend>CPU 종류</legend>
        <label>
          <input type="checkbox" /> 코어i5
        </label>
        <label>
          <input type="checkbox" /> 코어 울트라5
        </label>
        <label>
          <input type="checkbox" /> 코어 울트라7
        </label>
        <label>
          <input type="checkbox" /> 라이젠5
        </label>
        <label>
          <input type="checkbox" /> 라이젠5(ZEN3)
        </label>
      </fieldset>

      {/* 램 */}
      <fieldset>
        <legend>램</legend>
        <label>
          <input type="checkbox" /> 8GB
        </label>
        <label>
          <input type="checkbox" /> 16GB
        </label>
        <label>
          <input type="checkbox" /> 32GB
        </label>
        <label>
          <input type="checkbox" /> 64GB
        </label>
        <label>
          <input type="checkbox" /> 128GB
        </label>
      </fieldset>
    </div>
  );
}

export default CheckBox;
