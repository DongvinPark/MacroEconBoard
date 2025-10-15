import { type AppMeta } from '../../utils/AppMeta'

type DurationProps = {
    appMeta: AppMeta;
    currentLang: string;
    onChangeDuration: (newDuration: number) => void;
}

function DurationSelection(
    {appMeta, currentLang, onChangeDuration}: DurationProps
) {

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = Number(e.target.value);
        onChangeDuration(newValue);
    };

    // 함수형 컴포넌트는 반드시 return 문 안에서 하나의 루트 태그만 리턴해야 한다.
    return (
        <div>
            <label htmlFor="period">{appMeta['contents-text'][currentLang]['select-duration'] + " : " }</label>
            <select id="period" name="period" onChange={handleChange}>
                {
                    appMeta['supporting-duration-years'].map(
                        (year) => (
                            <option key={year} value={year}>
                                {
                                    appMeta['contents-text'][currentLang]['duration-year-word'][0]
                                    + " " + year + " " +
                                    appMeta['contents-text'][currentLang]['duration-year-word'][1]
                                }
                            </option>
                        )
                    )
                }
            </select>
        </div>
    );
}

export default DurationSelection;