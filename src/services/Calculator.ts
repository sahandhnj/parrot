export class Calculator {
    static calculate = (question) => {
        question = question.replace('divided by', '/');
        
        let numbers = question.match(/\d+/g);
        let signs = question.match(/[+-/*]/g);

        let result = parseInt(numbers[0]);
        let answer = "The answer to " + numbers[0];

        for (let i = 0; i < numbers.length; i++) {
            if (signs && signs[i] && numbers[i + 1]) {
                switch (signs[i]) {
                    case "+":
                        answer += " + " + numbers[i + 1];
                        result = result + parseInt(numbers[i + 1]);
                        break;
                    case "-":
                        answer += " - " + numbers[i + 1];
                        result = result - parseInt(numbers[i + 1]);
                        break;
                    case "/":
                        answer += " / " + numbers[i + 1];
                        result = result / parseInt(numbers[i + 1]);
                        break;
                    case "*":
                        answer += " * " + numbers[i + 1];
                        result = result * parseInt(numbers[i + 1]);
                        break;
                }
            }
        }

        answer += " is " + result.toString();
        return answer;
    }
}

