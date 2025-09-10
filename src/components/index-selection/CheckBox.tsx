
function CheckBox() {
    // TODO 인풋 태그들의 내용몰들은 나중에 수정한다.
  return (
    <div>
      {/* 주석공간 */}
      <h3>한국</h3>
      <fieldset>
        <legend>주가지수</legend>
        <label>
          <input type="checkbox" /> KOSPI
        </label>
        <br></br>
        <label>
          <input type="checkbox" /> KOSDAQ
        </label>
      </fieldset>

      {/* 주석공간 */}
      <fieldset>
        <legend>금리</legend>
        <label>
          <input type="checkbox" /> 한국은행 기준금리
        </label>
        <br></br>
        <label>
          <input type="checkbox" /> 국채 3년물
        </label>
        <br></br>
        <label>
          <input type="checkbox" /> 국채 5년물
        </label>
        <br></br>
        <label>
          <input type="checkbox" /> 국채 10년물
        </label>
      </fieldset>

          {/* 주석공간 */}
      <h3>미국</h3>
      <fieldset>
        <legend>주가지수</legend>
        <label>
          <input type="checkbox" /> S&P 500
        </label>
        <br></br>
        <label>
          <input type="checkbox" /> NASDAQ composites
        </label>
        <br></br>
        <label>
          <input type="checkbox" /> Dow Jones Industrial Avg
        </label>
      </fieldset>

      {/* 주석공간 */}
      <fieldset>
        <legend>금리</legend>
        <label>
          <input type="checkbox" /> 미국기준금리(Federal Funds Rate)
        </label>
        <br></br>
        <label>
          <input type="checkbox" /> 미국 국채 2년물
        </label>
        <br></br>
        <label>
          <input type="checkbox" /> 미국 국채 10년물
        </label>
      </fieldset>
    
    </div>
  );
}

export default CheckBox;
