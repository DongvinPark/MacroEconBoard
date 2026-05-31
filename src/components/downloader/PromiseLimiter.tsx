/**
 * PromiseLimiter
 * * [백엔드 개념 비유]
 * Java의 'FixedThreadPool'(ThreadPoolExecutor) 및 세마포어(Semaphore)와 유사한 역할.
 * 단, JS/TS는 싱글 스레드 환경이므로 실제 'OS 스레드 풀'을 만드는 것이 아니라,
 * 이벤트 루프(Event Loop)에 진입할 비동기 작업(Promise)의 '동시 실행 개수'를 제어하는 밸브 역할을 한다.
 */
export class PromiseLimiter {
    // 🔒 # 심볼은 JS/TS 표준 Private 문법으로, 런타임 환경에서도 외부 접근을 완벽히 차단(캡슐화)합니다.
    #max: number;                          // 최대 동시 실행 허용 수 (Java의 corePoolSize / maxPoolSize와 동일)
    #running = 0;                          // 현재 활성화되어 실행 중인 비동기 작업의 개수 (Active Count)
    #queue: (() => void)[] = [];           // 대기 중인 작업들이 머무는 큐 (Java의 LinkedBlockingQueue와 유사)

    constructor(max: number) {
        this.#max = max;
    }

    /**
     * run<T> (Java의 executorService.submit(Callable<T>) 과 1:1 매칭)
     * * 실행할 비동기 함수(fn)를 인자로 받아, Limiter의 통제를 받는 새로운 Promise를 리턴함.
     * 외부(호출자)는 이 메소드가 리턴한 Promise를 await 하면서 작업 완료를 기다리게 됨.
     */
    run<T>(fn: () => Promise<T>): Promise<T> {
        // 호출자에게는 이 "제어권이 담긴 래퍼 프로미스"를 반환합니다.
        return new Promise((resolve, reject) => {
            
            // 큐에 담을 실제 작업(Task) 단위를 정의합니다. (Java의 Runnable 객체 빌드 단계)
            const task = async () => {
                try {
                    // 내부 카운터가 허용되어 드디어 내 차례가 왔을 때, 진짜 비동기 작업(fetch 등)을 실행.
                    const result = await fn();
                    resolve(result); // 성공 시 외부에서 기다리는 await에 결과 전달
                } catch (error) {
                    reject(error);   // 실패 시 외부 await로 예외 전파 (스레드 중단 없이 예외만 전달)
                } finally {
                    // [핵심] 성공하든 실패하든(try든 catch든) 작업이 끝났으므로 자원을 반납함.
                    this.#running--; 
                    this.#next();    // 빈 슬롯이 생겼으니 큐에서 다음 작업을 깨움.
                }
            };

            // 1. 대기 큐(LinkedBlockingQueue)에 방금 만든 Task를 밀어 넣음.
            this.#queue.push(task);
            
            // 2. 스레드 풀의 여유 공간이 있는지 확인하고 실행 가능한 상태면 즉시 실행함.
            this.#next();
        });
    }

    /**
     * #next() (스레드 풀 스케줄러 기능)
     * * 큐에 쌓인 작업을 꺼내어 실행할지 여부를 판단하는 핵심 제어 루프.
     * 싱글 스레드 환경이므로 synchronized 키워드나 Mutex/Lock 없이도 
     * 카운터 오염(Race Condition) 염려 없이 안전하게 상태를 변경함.
     */
    #next() {
        // [조건 검사] 
        // 현재 실행 중인 작업이 꽉 찼거나(running >= max), 더 이상 대기 중인 작업이 없다면 대기(Return)함.
        if (this.#running >= this.#max || this.#queue.length === 0) return;

        // 실행 여유가 있으므로 실행 카운트를 += 1.
        this.#running++;
        
        // 큐의 맨 앞(First)에서 작업을 하나 꺼내옴. (Java의 queue.poll()과 동일)
        const nextTask = this.#queue.shift();
        
        // Task가 존재하면 실행한다. (?는 undefined 방어용 Optional Chaining)
        // 여기서 nextTask()를 호출하면 위의 task 내부의 'await fn()'이 트리거 됨.
        nextTask?.();
    }
}