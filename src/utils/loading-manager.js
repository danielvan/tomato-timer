/**
 * Loading Manager - Comprehensive loading states and progress indicators
 */

class LoadingManager {
    constructor() {
        this.loadingStates = new Map()
        this.globalLoading = false
        this.loadingOverlay = null
        this.progressBar = null
        this.loadingQueue = []
        this.isProcessingQueue = false
    }

    // Initialize loading manager
    init() {
        this.createLoadingOverlay()
        this.createProgressBar()
        this.setupGlobalLoading()
        console.log('Loading manager initialized')
    }

    // Create loading overlay
    createLoadingOverlay() {
        this.loadingOverlay = document.createElement('div')
        this.loadingOverlay.className = 'loading-overlay'
        this.loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading...</div>
            </div>
        `
        
        this.loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(4px);
        `
        
        document.body.appendChild(this.loadingOverlay)
    }

    // Create progress bar
    createProgressBar() {
        this.progressBar = document.createElement('div')
        this.progressBar.className = 'progress-bar'
        this.progressBar.innerHTML = `
            <div class="progress-fill"></div>
        `
        
        this.progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: #f3f4f6;
            z-index: 10000;
            display: none;
        `
        
        const progressFill = this.progressBar.querySelector('.progress-fill')
        progressFill.style.cssText = `
            height: 100%;
            background-color: #3b82f6;
            width: 0%;
            transition: width 0.3s ease;
        `
        
        document.body.appendChild(this.progressBar)
    }

    // Setup global loading
    setupGlobalLoading() {
        // Monitor page load state
        document.addEventListener('DOMContentLoaded', () => {
            this.hideGlobalLoading()
        })

        // Monitor beforeunload
        window.addEventListener('beforeunload', () => {
            this.showGlobalLoading('Saving changes...')
        })
    }

    // Show loading state for a specific operation
    showLoading(operationId, message = 'Loading...', options = {}) {
        const loadingState = {
            id: operationId,
            message,
            startTime: Date.now(),
            progress: 0,
            options: {
                showOverlay: options.showOverlay !== false,
                showProgress: options.showProgress || false,
                autoHide: options.autoHide !== false,
                timeout: options.timeout || 30000, // 30 seconds default
                ...options
            }
        }

        this.loadingStates.set(operationId, loadingState)

        // Show loading UI
        if (loadingState.options.showOverlay) {
            this.showLoadingOverlay(message)
        }

        if (loadingState.options.showProgress) {
            this.showProgressBar()
        }

        // Set timeout for auto-hide
        if (loadingState.options.autoHide) {
            setTimeout(() => {
                if (this.loadingStates.has(operationId)) {
                    this.hideLoading(operationId)
                }
            }, loadingState.options.timeout)
        }

        return loadingState
    }

    // Hide loading state for a specific operation
    hideLoading(operationId) {
        const loadingState = this.loadingStates.get(operationId)
        if (!loadingState) return

        this.loadingStates.delete(operationId)

        // Hide loading UI if no other operations are loading
        if (this.loadingStates.size === 0) {
            this.hideLoadingOverlay()
            this.hideProgressBar()
        }

        // Log loading duration
        const duration = Date.now() - loadingState.startTime
        console.log(`Operation ${operationId} completed in ${duration}ms`)
    }

    // Update loading progress
    updateProgress(operationId, progress) {
        const loadingState = this.loadingStates.get(operationId)
        if (!loadingState) return

        loadingState.progress = Math.max(0, Math.min(100, progress))

        // Update progress bar if visible
        if (loadingState.options.showProgress) {
            this.updateProgressBar(loadingState.progress)
        }

        // Update loading message if progress is provided
        if (loadingState.options.showOverlay) {
            this.updateLoadingMessage(`${loadingState.message} (${Math.round(loadingState.progress)}%)`)
        }
    }

    // Show loading overlay
    showLoadingOverlay(message = 'Loading...') {
        if (!this.loadingOverlay) return

        const loadingText = this.loadingOverlay.querySelector('.loading-text')
        if (loadingText) {
            loadingText.textContent = message
        }

        this.loadingOverlay.style.display = 'flex'
        this.globalLoading = true
    }

    // Hide loading overlay
    hideLoadingOverlay() {
        if (!this.loadingOverlay) return

        this.loadingOverlay.style.display = 'none'
        this.globalLoading = false
    }

    // Update loading message
    updateLoadingMessage(message) {
        if (!this.loadingOverlay || !this.globalLoading) return

        const loadingText = this.loadingOverlay.querySelector('.loading-text')
        if (loadingText) {
            loadingText.textContent = message
        }
    }

    // Show progress bar
    showProgressBar() {
        if (!this.progressBar) return

        this.progressBar.style.display = 'block'
        this.updateProgressBar(0)
    }

    // Hide progress bar
    hideProgressBar() {
        if (!this.progressBar) return

        this.progressBar.style.display = 'none'
    }

    // Update progress bar
    updateProgressBar(progress) {
        if (!this.progressBar) return

        const progressFill = this.progressBar.querySelector('.progress-fill')
        if (progressFill) {
            progressFill.style.width = `${progress}%`
        }
    }

    // Show global loading
    showGlobalLoading(message = 'Loading...') {
        this.showLoadingOverlay(message)
    }

    // Hide global loading
    hideGlobalLoading() {
        this.hideLoadingOverlay()
    }

    // Create loading button
    createLoadingButton(button, operationId, options = {}) {
        const originalText = button.textContent
        const originalDisabled = button.disabled

        // Show loading state
        button.disabled = true
        button.innerHTML = `
            <span class="loading-spinner-small"></span>
            ${options.loadingText || 'Loading...'}
        `

        // Add loading class
        button.classList.add('loading')

        // Return function to restore button
        return () => {
            button.disabled = originalDisabled
            button.textContent = originalText
            button.classList.remove('loading')
        }
    }

    // Create loading input
    createLoadingInput(input, operationId, options = {}) {
        const originalValue = input.value
        const originalPlaceholder = input.placeholder
        const originalDisabled = input.disabled

        // Show loading state
        input.disabled = true
        input.value = ''
        input.placeholder = options.loadingText || 'Loading...'

        // Add loading class
        input.classList.add('loading')

        // Return function to restore input
        return () => {
            input.disabled = originalDisabled
            input.value = originalValue
            input.placeholder = originalPlaceholder
            input.classList.remove('loading')
        }
    }

    // Create loading modal
    createLoadingModal(modal, operationId, options = {}) {
        const originalContent = modal.innerHTML
        const loadingContent = `
            <div class="loading-modal-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${options.message || 'Loading...'}</div>
                ${options.showProgress ? '<div class="loading-progress">0%</div>' : ''}
            </div>
        `

        // Show loading content
        modal.innerHTML = loadingContent

        // Return function to restore modal
        return () => {
            modal.innerHTML = originalContent
        }
    }

    // Queue loading operations
    queueLoading(operationId, priority = 'normal') {
        const queueItem = {
            id: operationId,
            priority,
            timestamp: Date.now()
        }

        this.loadingQueue.push(queueItem)
        this.loadingQueue.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1
            if (b.priority === 'high' && a.priority !== 'high') return 1
            return a.timestamp - b.timestamp
        })

        if (!this.isProcessingQueue) {
            this.processQueue()
        }
    }

    // Process loading queue
    async processQueue() {
        if (this.isProcessingQueue || this.loadingQueue.length === 0) return

        this.isProcessingQueue = true

        while (this.loadingQueue.length > 0) {
            const item = this.loadingQueue.shift()
            
            // Show loading for this item
            this.showLoading(item.id, `Processing ${item.id}...`, {
                showOverlay: true,
                showProgress: true
            })

            // Simulate processing time (in real app, this would be the actual operation)
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Hide loading
            this.hideLoading(item.id)
        }

        this.isProcessingQueue = false
    }

    // Create loading wrapper for async operations
    withLoading(operation, operationId, options = {}) {
        return async (...args) => {
            try {
                this.showLoading(operationId, options.message || 'Loading...', options)
                
                const result = await operation(...args)
                
                this.hideLoading(operationId)
                return result
            } catch (error) {
                this.hideLoading(operationId)
                throw error
            }
        }
    }

    // Create loading wrapper with progress
    withProgress(operation, operationId, options = {}) {
        return async (...args) => {
            try {
                this.showLoading(operationId, options.message || 'Loading...', {
                    ...options,
                    showProgress: true
                })

                // Create progress callback
                const progressCallback = (progress) => {
                    this.updateProgress(operationId, progress)
                }

                const result = await operation(progressCallback, ...args)
                
                this.hideLoading(operationId)
                return result
            } catch (error) {
                this.hideLoading(operationId)
                throw error
            }
        }
    }

    // Get loading state
    getLoadingState(operationId) {
        return this.loadingStates.get(operationId)
    }

    // Check if operation is loading
    isLoading(operationId) {
        return this.loadingStates.has(operationId)
    }

    // Check if any operation is loading
    hasAnyLoading() {
        return this.loadingStates.size > 0
    }

    // Get all loading states
    getAllLoadingStates() {
        return Array.from(this.loadingStates.values())
    }

    // Clear all loading states
    clearAllLoading() {
        this.loadingStates.clear()
        this.hideLoadingOverlay()
        this.hideProgressBar()
    }

    // Add loading listener
    onLoadingChange(callback) {
        // This would be implemented with a proper event system
        // For now, we'll use a simple callback approach
        this.loadingChangeCallback = callback
    }

    // Notify loading change
    notifyLoadingChange() {
        if (this.loadingChangeCallback) {
            this.loadingChangeCallback(this.getAllLoadingStates())
        }
    }
}

// Create global loading manager instance
const loadingManager = new LoadingManager()

// Export for use in other modules
window.loadingManager = loadingManager

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadingManager.init())
} else {
    loadingManager.init()
}

export default loadingManager
