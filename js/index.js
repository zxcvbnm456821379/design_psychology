import { questionBank } from './js/question.js';

// 添加更多题目示例（实际使用时需要包含所有203题）
for (let i = 11; i <= 203; i++) {
    questionBank.push({
        id: i,
        question: `这是第${i}道题目示例，答案是"示例${i}"`,
        answer: `示例${i}`
    });
}

// 应用状态
let currentIndex = 0;
let currentQuestions = [...questionBank];
let correctCount = 0;
let reviewQuestions = [];
let isAnswerShown = false;
let mode = 'review';
let range = 'all';

// DOM元素
const questionText = document.getElementById('questionText');
const currentNumber = document.getElementById('currentNumber');
const totalCards = document.getElementById('totalCards');
const correctCountEl = document.getElementById('correctCount');
const progressFill = document.getElementById('progressFill');
const inputContainer = document.getElementById('inputContainer');
const answerInput = document.getElementById('answerInput');
const showAnswerBtn = document.getElementById('showAnswer');
const checkAnswerBtn = document.getElementById('checkAnswer');
const nextCardBtn = document.getElementById('nextCard');
const modeSelect = document.getElementById('modeSelect');
const rangeSelect = document.getElementById('rangeSelect');
const restartBtn = document.getElementById('restartBtn');
const reviewList = document.getElementById('reviewList');

// 初始化
function init() {
    totalCards.textContent = questionBank.length;
    updateStats();
    loadQuestion();
    
    // 设置事件监听
    showAnswerBtn.addEventListener('click', showAnswer);
    checkAnswerBtn.addEventListener('click', checkAnswer);
    nextCardBtn.addEventListener('click', nextQuestion);
    modeSelect.addEventListener('change', changeMode);
    rangeSelect.addEventListener('change', changeRange);
    restartBtn.addEventListener('click', restart);
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // 根据模式更新UI
    updateUIForMode();
}

// 加载题目
function loadQuestion() {
    if (currentQuestions.length === 0) {
        questionText.innerHTML = `<h3>恭喜！你已经完成了所有题目！</h3>
                                 <p>答对题目数: ${correctCount}/${currentQuestions.length}</p>
                                 ${reviewQuestions.length > 0 ? `<p>还有${reviewQuestions.length}道题目需要复习</p>` : ''}`;
        return;
    }
    
    const question = currentQuestions[currentIndex];
    currentNumber.textContent = question.id;
    
    // 创建填空题目
    let displayQuestion = question.question;
    // 找到括号内的内容并替换为填空
    const regex = /（\s*）/g; // 匹配中文括号
    const regex2 = /\(\s*\)/g; // 匹配英文括号
    
    if (regex.test(displayQuestion)) {
        displayQuestion = displayQuestion.replace(regex, '<span class="blank" data-answer="' + question.answer + '">_____</span>');
    } else if (regex2.test(displayQuestion)) {
        displayQuestion = displayQuestion.replace(regex2, '<span class="blank" data-answer="' + question.answer + '">_____</span>');
    } else {
        // 如果没有括号，直接替换答案部分
        const answerIndex = displayQuestion.indexOf(question.answer);
        if (answerIndex !== -1) {
            displayQuestion = displayQuestion.substring(0, answerIndex) + 
                             '<span class="blank" data-answer="' + question.answer + '">_____</span>' + 
                             displayQuestion.substring(answerIndex + question.answer.length);
        }
    }
    
    questionText.innerHTML = displayQuestion;
    
    // 更新进度条
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
    progressFill.style.width = `${progress}%`;
    
    // 重置状态
    isAnswerShown = false;
    answerInput.value = '';
    inputContainer.classList.remove('active');
    
    // 更新按钮状态
    checkAnswerBtn.disabled = false;
    checkAnswerBtn.textContent = '检查答案';
    
    updateUIForMode();
}

// 显示答案
function showAnswer() {
    if (currentQuestions.length === 0) return;
    
    const blanks = document.querySelectorAll('.blank');
    blanks.forEach(blank => {
        const answer = blank.getAttribute('data-answer');
        blank.textContent = answer;
        blank.classList.add('filled');
    });
    
    isAnswerShown = true;
    checkAnswerBtn.disabled = true;
    checkAnswerBtn.textContent = '答案已显示';
}

// 检查答案
function checkAnswer() {
    if (currentQuestions.length === 0 || isAnswerShown) return;
    
    const userAnswer = answerInput.value.trim();
    const currentQuestion = currentQuestions[currentIndex];
    const isCorrect = userAnswer === currentQuestion.answer;
    
    const blanks = document.querySelectorAll('.blank');
    blanks.forEach(blank => {
        const correctAnswer = blank.getAttribute('data-answer');
        blank.textContent = correctAnswer;
        blank.classList.add('filled');
        
        if (userAnswer === correctAnswer) {
            blank.classList.add('correct');
        } else {
            blank.classList.add('wrong');
        }
    });
    
    if (isCorrect) {
        correctCount++;
    } else {
        // 添加到复习列表
        if (!reviewQuestions.some(q => q.id === currentQuestion.id)) {
            reviewQuestions.push(currentQuestion);
            updateReviewList();
        }
    }
    
    updateStats();
    checkAnswerBtn.disabled = true;
    checkAnswerBtn.textContent = isCorrect ? '回答正确！' : '回答错误';
}

// 下一题
function nextQuestion() {
    if (currentQuestions.length === 0) return;
    
    currentIndex++;
    if (currentIndex >= currentQuestions.length) {
        if (mode === 'exam') {
            // 考试模式结束，显示结果
            questionText.innerHTML = `<h3>考试结束！</h3>
                                     <p>你的得分: ${correctCount}/${currentQuestions.length}</p>
                                     <p>正确率: ${Math.round((correctCount / currentQuestions.length) * 100)}%</p>`;
            return;
        } else {
            // 循环到开始
            currentIndex = 0;
            if (mode === 'random') {
                shuffleArray(currentQuestions);
            }
        }
    }
    
    loadQuestion();
}

// 更新统计数据
function updateStats() {
    correctCountEl.textContent = correctCount;
}

// 更新复习列表
function updateReviewList() {
    if (reviewQuestions.length === 0) {
        reviewList.classList.remove('active');
        return;
    }
    
    reviewList.classList.add('active');
    reviewList.innerHTML = '<h3>需要复习的题目 (' + reviewQuestions.length + ')</h3>';
    
    reviewQuestions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'review-item';
        item.innerHTML = `<strong>${q.id}.</strong> ${q.question.replace(/（\s*）/g, '（' + q.answer + '）').replace(/\(\s*\)/g, '(' + q.answer + ')')}`;
        reviewList.appendChild(item);
    });
}

// 更改模式
function changeMode() {
    mode = modeSelect.value;
    updateUIForMode();
    restart();
}

// 更改范围
function changeRange() {
    range = rangeSelect.value;
    restart();
}

// 根据模式更新UI
function updateUIForMode() {
    if (mode === 'exam') {
        inputContainer.classList.add('active');
        showAnswerBtn.style.display = 'none';
        checkAnswerBtn.style.display = 'inline-block';
    } else {
        inputContainer.classList.remove('active');
        showAnswerBtn.style.display = 'inline-block';
        checkAnswerBtn.style.display = 'inline-block';
    }
}

// 重新开始
function restart() {
    // 根据范围筛选题目
    if (range === 'all') {
        currentQuestions = [...questionBank];
    } else {
        const [start, end] = range.split('-').map(Number);
        currentQuestions = questionBank.filter(q => q.id >= start && q.id <= end);
    }
    
    // 根据模式处理题目顺序
    if (mode === 'random') {
        shuffleArray(currentQuestions);
    }
    
    // 重置状态
    currentIndex = 0;
    correctCount = 0;
    reviewQuestions = [];
    
    // 更新UI
    updateStats();
    updateReviewList();
    loadQuestion();
}

// 随机打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
