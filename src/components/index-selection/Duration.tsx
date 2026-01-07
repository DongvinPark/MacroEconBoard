import { type AppMeta } from '../../utils/AppMeta'

type DurationProps = {
    appMeta: AppMeta;
    currentLang: string;
    onChangeDuration: (newDuration: number) => void;
    isFromPart: boolean;
}

function DurationSelection(
    {appMeta, currentLang, onChangeDuration, isFromPart}: DurationProps
) {

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = Number(e.target.value);
        onChangeDuration(newValue);
    };

    const earliestYear = appMeta['earliest-year'];
    const todayYear = new Date().getFullYear();

    var yearList: number[] = [];
    for(let i=todayYear; i>= earliestYear; i--){
        yearList.push(i);
    }

    // 함수형 컴포넌트는 반드시 return 문 안에서 하나의 루트 태그만 리턴해야 한다.
    return (
        <div>
            <label htmlFor="period">{ ( isFromPart == true ? "From" : "To" ) + " : " }</label>
            <select id="period" name="period" onChange={handleChange}>
                {
                    yearList.map(
                        (year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        )
                    )
                }
            </select>
        </div>
    );
}

export default DurationSelection;