// Variables Globales

// Referencias a elementos del DOM
const arrayContainer = document.getElementById('array-container');
const startButton = document.getElementById('start-button');
const stepButton = document.getElementById('step-button');
const autoButton = document.getElementById('auto-button');
const generateArrayButton = document.getElementById('generate-array');
const algorithmSelect = document.getElementById('algorithm-select');

// Descripciones de los algoritmos
const algorithmDescriptions = {
    bubble: {
        title: "Bubble Sort",
        description: "Compara elementos adyacentes e intercambia si están en el orden incorrecto. Repite el proceso hasta que el arreglo esté ordenado.",
        complexity: "Complejidad: O(n²) peor caso, O(n) mejor caso."
    },
    insertion: {
        title: "Insertion Sort",
        description: "Divide el arreglo en una parte ordenada y otra desordenada, e inserta elementos uno por uno en la posición correcta.",
        complexity: "Complejidad: O(n²) peor caso, O(n) mejor caso."
    },
    selection: {
        title: "Selection Sort",
        description: "Encuentra el elemento más pequeño y lo coloca en su posición final. Repite hasta que el arreglo esté ordenado.",
        complexity: "Complejidad: O(n²) en todos los casos."
    },
    merge: {
        title: "Merge Sort",
        description: "Divide el arreglo en mitades recursivamente y luego combina los subarreglos de forma ordenada.",
        complexity: "Complejidad: O(n log n) en todos los casos."
    },
    quick: {
        title: "Quick Sort",
        description: "Selecciona un pivote, divide el arreglo en elementos menores y mayores al pivote, y los ordena recursivamente.",
        complexity: "Complejidad: O(n log n) promedio, O(n²) peor caso."
    }
};

// Referencia al contenedor de información
const algorithmInfo = document.getElementById('algorithm-info');

// Variables para el manejo del array y el algoritmo
let array = [];                // Array que contiene los números a ordenar
let currentAlgorithm = 'bubble'; // Algoritmo seleccionado actualmente
let isSorting = false;         // Indicador de si el algoritmo está en ejecución
let intervalId = null;         // Identificador del intervalo para ejecución automática

// Variables para los algoritmos
let i = 0;       // Índice principal
let j = 0;       // Índice secundario
let minIdx = 0;  // Índice del mínimo en Selection Sort
let key;         // Clave en Insertion Sort
let comparisonCount = 0; // Contador de comparaciones
let swapCount = 0;       // Contador de intercambios

// Actualiza la descripción cuando cambia la selección
document.getElementById('algorithm-select').addEventListener('change', (e) => {
    const selectedAlgorithm = e.target.value;
    const info = algorithmDescriptions[selectedAlgorithm];
    if (info) {
        algorithmInfo.innerHTML = `<strong>${info.title}:</strong> ${info.description} <br><em>${info.complexity}</em>`;
    }
});

// Función para generar un array aleatorio
function generateArray(size = parseInt(document.getElementById('arraySize').value)) {
    array = []; // Reinicia el array
    for (let i = 0; i < size; i++) {
        // Agrega números aleatorios entre 1 y 100
        array.push(Math.floor(Math.random() * 100) + 1);
    }
    // Guarda una copia del arreglo original
    originalArray = [...array]; 

    resetVariables();    // Reinicia las variables del algoritmo
    renderArray(array);  // Renderiza el array en el DOM
}

// Función para renderizar el array en el DOM
function renderArray(arr, activeIndices = [], sortedIndices = []) {
    arrayContainer.innerHTML = ''; // Limpia el contenido previo
    arr.forEach((value, idx) => {
        // Crea un elemento div para representar cada valor del array
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value * 3}px`; // Altura proporcional al valor

        // Resaltar barras activas
        if (activeIndices.includes(idx)) {
            bar.classList.add('active');
        }
        // Resaltar barras ya ordenadas
        if (sortedIndices.includes(idx)) {
            bar.classList.add('sorted');
        }

        // Agrega una etiqueta con el valor numérico
        const barLabel = document.createElement('div');
        barLabel.classList.add('bar-label');
        barLabel.textContent = value;
        bar.appendChild(barLabel);

        arrayContainer.appendChild(bar); // Agrega la barra al contenedor
    });
}

// Función para reiniciar las variables de los algoritmos
function resetVariables() {
    i = 0;              // Reinicia el índice principal
    j = 0;              // Reinicia el índice secundario
    minIdx = 0;         // Reinicia el índice mínimo
    comparisonCount = 0;// Reinicia el contador de comparaciones
    swapCount = 0;      // Reinicia el contador de intercambios
    updateCounters();    // Actualiza los contadores en la interfaz
    key = undefined;    // Reinicia la clave para Insertion Sort
    isSorting = false;  // Indica que no se está ejecutando ningún algoritmo
    mergeSortArray = undefined;   // Reinicia la copia del array de Merge Sort
    mergeSortSteps = [];          // Reinicia los pasos de Merge Sort
    quickSortStack = undefined;   // Reinicia la pila de Quick Sort
    if (intervalId) {
        clearInterval(intervalId); // Detiene la ejecución automática si está activa
        intervalId = null;
    }
}

// Función para actualizar los contadores de comparaciones e intercambios
function updateCounters() {
    document.getElementById('comparisonCount').textContent = comparisonCount;
    document.getElementById('swapCount').textContent = swapCount;
}

// Controladores de eventos

// Cambiar el algoritmo seleccionado
algorithmSelect.addEventListener('change', () => {
    currentAlgorithm = algorithmSelect.value; // Actualiza el algoritmo actual
    resetVariables();    // Reinicia las variables
    renderArray(array);  // Renderiza el array
});

// Generar un nuevo array al hacer clic en el botón
generateArrayButton.addEventListener('click', () => {
    generateArray(); // Genera un nuevo array
    resetVariables();    // Reinicia las variables
});

// Iniciar o reiniciar el ordenamiento
startButton.addEventListener('click', () => {
    resetVariables();    // Reinicia las variables
    renderArray(array);  // Renderiza el array
});

// Avanzar un paso en el algoritmo
stepButton.addEventListener('click', () => {
    if (!isSorting) {    // Evita conflictos si ya se está ejecutando un paso
        isSorting = true;
        switch (currentAlgorithm) {
            case 'bubble':
                bubbleSortStep();     // Ejecuta un paso de Bubble Sort
                break;
            case 'insertion':
                insertionSortStep();  // Ejecuta un paso de Insertion Sort
                break;
            case 'selection':
                selectionSortStep();  // Ejecuta un paso de Selection Sort
                break;
            case 'merge':
                mergeSortStep();
                break;
            case 'quick':
                quickSortStep();
                break;
        }
        isSorting = false;
    }
});

// Ejecutar el algoritmo automáticamente
autoButton.addEventListener('click', () => {
    if (!intervalId) {   // Verifica que no haya ya una ejecución en curso
        intervalId = setInterval(() => {
            stepButton.click();   // Simula un clic en el botón de siguiente paso
            // Verifica si el algoritmo ha terminado para detener la ejecución automática
            if (currentAlgorithm === 'bubble' && i > array.length) {
                clearInterval(intervalId);
                intervalId = null;
            }
            if (currentAlgorithm === 'insertion' && i >= array.length && typeof key === 'undefined') {
                clearInterval(intervalId);
                intervalId = null;
            }
            if (currentAlgorithm === 'selection' && i >= array.length) {
                clearInterval(intervalId);
                intervalId = null;
            }
            if (currentAlgorithm === 'merge' && mergeSortSteps.length === 0) {
                clearInterval(intervalId);
                intervalId = null;
            }
            if (currentAlgorithm === 'quick' && quickSortStack.length === 0) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }, 200); // Intervalo de tiempo entre pasos automáticos (200 ms)
    }
});

document.getElementById('reset-array').addEventListener('click', () => {
    if (originalArray.length > 0) {
        array = [...originalArray]; // Restaura el arreglo original
        resetVariables();           // Reinicia contadores y variables
        renderArray(array);         // Renderiza el array en el DOM
    } else {
        alert("Primero genera un arreglo para reiniciarlo.");
    }
});

// Implementación de Bubble Sort
function bubbleSortStep() {
    // Verifica si aún no se ha completado el recorrido del array
    if (i < array.length) {
        // Verifica si no ha llegado al final de la pasada actual
        if (j < array.length - i - 1) {
            comparisonCount++; // Incrementa las comparaciones
            updateCounters();  // Actualiza la interfaz
            // Compara elementos adyacentes
            if (array[j] > array[j + 1]) {
                // Intercambia si están en el orden incorrecto
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                swapCount++; // Incrementa los intercambios
                updateCounters();  // Actualiza la interfaz
            }
            // Renderiza el array resaltando los elementos comparados
            renderArray(array, [j, j + 1], Array.from({ length: i }, (_, idx) => array.length - idx - 1));
            j++; // Avanza al siguiente par de elementos
        } else {
            j = 0; // Reinicia j para la siguiente pasada
            i++;   // Incrementa i para indicar que un elemento más está en su posición final
        }
    } else {
        // Algoritmo completado, resalta todo el array como ordenado
        renderArray(array, [], Array.from({ length: array.length }, (_, idx) => idx));
    }
}

// Implementación de Insertion Sort
function insertionSortStep() {
    if (i < array.length) {
        if (typeof key === 'undefined') {
            // Inicia un nuevo ciclo de inserción
            key = array[i];  // Clave a insertar
            j = i - 1;       // Índice del elemento anterior
        }

        if (j >= 0 && array[j] > key) {
            
            // Desplaza los elementos mayores que la clave hacia la derecha
            array[j + 1] = array[j];


            // Renderiza el array resaltando los elementos comparados
            renderArray(array, [j, j + 1], Array.from({ length: i }, (_, idx) => idx));
            j--; // Decrementa j para continuar comparando hacia atrás
            swapCount++; // Incrementa los intercambios
            updateCounters();  // Actualiza la interfaz
        } else {
            // Inserta la clave en su posición correcta
            array[j + 1] = key;
            i++;           // Avanza al siguiente elemento
            key = undefined; // Reinicia la clave para el próximo ciclo
            comparisonCount++; // Incrementa las comparaciones
            updateCounters();  // Actualiza la interfaz

            // Renderiza el array mostrando la inserción
            renderArray(array, [i - 1], Array.from({ length: i }, (_, idx) => idx));
        }
    } else {
        // Algoritmo completado, resalta todo el array como ordenado
        renderArray(array, [], Array.from({ length: array.length }, (_, idx) => idx));
    }
}


// Implementación de Selection Sort
function selectionSortStep() {
    // Verifica si aún no se ha completado el recorrido del array
    if (i < array.length) {
        if (j === 0 || j < i) {
            // Inicializa minIdx al comienzo de la porción no ordenada
            minIdx = i;
            j = i + 1;
        }

        if (j < array.length) {
            comparisonCount++; // Incrementa las comparaciones
            updateCounters();  // Actualiza la interfaz
            // Busca el elemento mínimo en la porción no ordenada
            if (array[j] < array[minIdx]) {
                minIdx = j; // Actualiza minIdx si encuentra un valor menor
            }
            // Renderiza el array resaltando el elemento actual y el mínimo encontrado
            renderArray(array, [j, minIdx], Array.from({ length: i }, (_, idx) => idx));
            j++; // Avanza al siguiente elemento
        } else {
            // Intercambia el mínimo encontrado con el primer elemento no ordenado
            if (minIdx !== i) { // Solo intercambia si es necesario
                [array[i], array[minIdx]] = [array[minIdx], array[i]];
                swapCount++; // Incrementa los intercambios
                updateCounters();  // Actualiza la interfaz
            }
            // Renderiza el array mostrando el intercambio y marcando el elemento como ordenado
            renderArray(array, [i, minIdx], Array.from({ length: i + 1 }, (_, idx) => idx));
            i++; // Incrementa i para reducir la porción no ordenada
            j = 0; // Reinicia j para la siguiente iteración
        }
    } else {
        // Algoritmo completado, resalta todo el array como ordenado
        renderArray(array, [], Array.from({ length: array.length }, (_, idx) => idx));
    }
}

// Implementación de Merge Sort
function mergeSortStep() {
    // Divide el array si es necesario
    if (typeof mergeSortArray === 'undefined') {
        mergeSortArray = array.slice(); // Crea una copia del array original
        mergeSortSteps = [];
        divideArray(mergeSortArray, 0, mergeSortArray.length - 1, mergeSortSteps);
    }

    // Ejecuta un paso del proceso de merge
    if (mergeSortSteps.length > 0) {
        const step = mergeSortSteps.shift();
        array = step.array; // Actualiza el array actual
        renderArray(array, step.activeIndices, step.sortedIndices);
        comparisonCount += step.comparisons; // Actualiza el contador de comparaciones
        swapCount += step.swaps;            // Actualiza el contador de intercambios
        updateCounters();                   // Actualiza los contadores en la interfaz
    } else {
        // Algoritmo completado
        renderArray(array, [], Array.from({ length: array.length }, (_, idx) => idx));
    }
}

// Función para dividir el array (recursivamente)
function divideArray(arr, start, end, steps) {
    if (start < end) {
        const mid = Math.floor((start + end) / 2);

        // Llama recursivamente para dividir
        divideArray(arr, start, mid, steps);
        divideArray(arr, mid + 1, end, steps);

        // Mezcla las mitades y guarda el paso
        mergeArrays(arr, start, mid, end, steps);
    }
}

// Función para mezclar los subarrays
function mergeArrays(arr, start, mid, end, steps) {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;
    let comparisons = 0, swaps = 0;

    while (i < left.length && j < right.length) {
        comparisons++;
        if (left[i] <= right[j]) {
            arr[k++] = left[i++];
        } else {
            arr[k++] = right[j++];
            swaps++;
        }
    }

    while (i < left.length) {
        arr[k++] = left[i++];
    }
    while (j < right.length) {
        arr[k++] = right[j++];
    }

    // Guarda el estado del array en el paso
    steps.push({
        array: arr.slice(),
        activeIndices: [start, end],
        sortedIndices: Array.from({ length: end - start + 1 }, (_, idx) => start + idx),
        comparisons,
        swaps
    });
}

// Implementación de Quick Sort
function quickSortStep() {
    if (typeof quickSortStack === 'undefined') {
        quickSortStack = [{ start: 0, end: array.length - 1 }];
    }

    if (quickSortStack.length > 0) {
        const { start, end } = quickSortStack.pop();

        if (start < end) {
            const pivotIndex = partition(array, start, end);
            quickSortStack.push({ start: start, end: pivotIndex - 1 });
            quickSortStack.push({ start: pivotIndex + 1, end: end });

            renderArray(array, [pivotIndex], Array.from({ length: end - start + 1 }, (_, idx) => start + idx));
        }
    } else {
        // Algoritmo completado
        renderArray(array, [], Array.from({ length: array.length }, (_, idx) => idx));
    }
}

// Función de partición para Quick Sort
function partition(arr, start, end) {
    const pivot = arr[end];
    let pivotIndex = start;
    for (let i = start; i < end; i++) {
        comparisonCount++;
        if (arr[i] < pivot) {
            [arr[i], arr[pivotIndex]] = [arr[pivotIndex], arr[i]];
            pivotIndex++;
            swapCount++;
        }
    }
    [arr[pivotIndex], arr[end]] = [arr[end], arr[pivotIndex]];
    swapCount++;
    updateCounters(); // Actualiza los contadores en la interfaz
    return pivotIndex;
}

// Inicializar con el algoritmo por defecto
document.getElementById('algorithm-select').dispatchEvent(new Event('change'));

// Inicializa el array al cargar la página
generateArray();