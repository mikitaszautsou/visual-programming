
const createNode = () => {

}


const container = document.getElementById('app')
const nodeWrapper = document.createElement('div')
nodeWrapper.style.background = 'red'
nodeWrapper.style.width = '100px'
nodeWrapper.style.height = '100px'
container.appendChild(nodeWrapper)

// console.log('ok')

new EventSource('/esbuild').addEventListener('change', () => location.reload())