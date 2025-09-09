

function DurationSelection() {
    // 함수형 컴포넌트는 반드시 return 문 안에서 하나의 루트 태그만 리턴해야 한다.
    return (
        <div>
            <label htmlFor="period">기간을 선택하세요: </label>
            <select id="period" name="period">
                <option value="1">최근 1년</option>
                <option value="2">최근 2년</option>
                <option value="3">최근 3년</option>
                <option value="5">최근 5년</option>
                <option value="10">최근 10년</option>
                <option value="20">최근 20년</option>
                <option value="40">최근 40년</option>
            </select>
        </div>
    );
}

export default DurationSelection;
