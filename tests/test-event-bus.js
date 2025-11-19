/**
 * EventBus Pattern Tests
 * Tests for the Observer Pattern implementation
 */

import { EventBus, eventBus, Events } from '../assets/js/event-bus.js';

export function runEventBusTests() {
    console.log('\n🧪 Testing EventBus Pattern\n');
    
    let passed = 0;
    let failed = 0;
    
    const tests = [
        testEventSubscriptionAndPublishing,
        testMultipleSubscribers,
        testUnsubscribe,
        testEventIsolation,
        testDataPassing,
        testMemoryLeakPrevention,
        testOnceSubscription,
        testErrorHandling,
        testSubscriberCount,
        testEventHistory,
        testClearSubscriptions,
        testInvalidCallback,
        testEventConstants
    ];
    
    for (const test of tests) {
        try {
            if (test()) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`  ❌ EXCEPTION: ${error.message}`);
            console.error(error);
            failed++;
        }
    }
    
    console.log(`\n📊 EventBus Tests: ${passed} passed, ${failed} failed\n`);
    return failed === 0;
}

function testEventSubscriptionAndPublishing() {
    console.log('🧪 Test: Event Subscription and Publishing');
    
    const testBus = new EventBus();
    let received = false;
    
    testBus.subscribe('test:event', () => {
        received = true;
    });
    
    testBus.publish('test:event');
    
    if (received) {
        console.log('  ✅ PASS: Event received by subscriber');
        return true;
    } else {
        console.log('  ❌ FAIL: Event not received');
        return false;
    }
}

function testMultipleSubscribers() {
    console.log('🧪 Test: Multiple Subscribers');
    
    const testBus = new EventBus();
    let count = 0;
    
    testBus.subscribe('test:multi', () => count++);
    testBus.subscribe('test:multi', () => count++);
    testBus.subscribe('test:multi', () => count++);
    
    testBus.publish('test:multi');
    
    if (count === 3) {
        console.log('  ✅ PASS: All 3 subscribers received event');
        return true;
    } else {
        console.log(`  ❌ FAIL: Expected 3 calls, got ${count}`);
        return false;
    }
}

function testUnsubscribe() {
    console.log('🧪 Test: Unsubscribe Functionality');
    
    const testBus = new EventBus();
    let count = 0;
    
    const unsubscribe = testBus.subscribe('test:unsub', () => count++);
    
    testBus.publish('test:unsub'); // count = 1
    unsubscribe();
    testBus.publish('test:unsub'); // count should still be 1
    
    if (count === 1) {
        console.log('  ✅ PASS: Unsubscribe prevents further calls');
        return true;
    } else {
        console.log(`  ❌ FAIL: Expected 1 call, got ${count}`);
        return false;
    }
}

function testEventIsolation() {
    console.log('🧪 Test: Event Isolation');
    
    const testBus = new EventBus();
    let event1Fired = false;
    let event2Fired = false;
    
    testBus.subscribe('event:one', () => event1Fired = true);
    testBus.subscribe('event:two', () => event2Fired = true);
    
    testBus.publish('event:one');
    
    if (event1Fired && !event2Fired) {
        console.log('  ✅ PASS: Events are properly isolated');
        return true;
    } else {
        console.log('  ❌ FAIL: Event isolation failed');
        return false;
    }
}

function testDataPassing() {
    console.log('🧪 Test: Data Passing');
    
    const testBus = new EventBus();
    let receivedData = null;
    
    testBus.subscribe('data:test', (data) => {
        receivedData = data;
    });
    
    const testData = { value: 42, name: 'test' };
    testBus.publish('data:test', testData);
    
    if (receivedData && receivedData.value === 42 && receivedData.name === 'test') {
        console.log('  ✅ PASS: Data passed correctly to subscriber');
        return true;
    } else {
        console.log('  ❌ FAIL: Data not received correctly');
        return false;
    }
}

function testMemoryLeakPrevention() {
    console.log('🧪 Test: Memory Leak Prevention');
    
    const testBus = new EventBus();
    const unsubscribers = [];
    
    // Add 100 subscribers
    for (let i = 0; i < 100; i++) {
        const unsub = testBus.subscribe('leak:test', () => {});
        unsubscribers.push(unsub);
    }
    
    const beforeCount = testBus.getSubscriberCount('leak:test');
    
    // Unsubscribe all
    unsubscribers.forEach(unsub => unsub());
    
    const afterCount = testBus.getSubscriberCount('leak:test');
    
    if (beforeCount === 100 && afterCount === 0) {
        console.log('  ✅ PASS: All subscribers properly cleaned up');
        return true;
    } else {
        console.log(`  ❌ FAIL: Memory leak detected (${afterCount} subscribers remaining)`);
        return false;
    }
}

function testOnceSubscription() {
    console.log('🧪 Test: Once Subscription');
    
    const testBus = new EventBus();
    let count = 0;
    
    testBus.once('test:once', () => count++);
    
    testBus.publish('test:once'); // count = 1
    testBus.publish('test:once'); // count should still be 1
    testBus.publish('test:once'); // count should still be 1
    
    if (count === 1) {
        console.log('  ✅ PASS: Once subscription fired only once');
        return true;
    } else {
        console.log(`  ❌ FAIL: Expected 1 call, got ${count}`);
        return false;
    }
}

function testErrorHandling() {
    console.log('🧪 Test: Error Handling in Subscribers');
    
    const testBus = new EventBus();
    let count = 0;
    
    // First subscriber throws error
    testBus.subscribe('test:error', () => {
        throw new Error('Test error');
    });
    
    // Second subscriber should still execute
    testBus.subscribe('test:error', () => {
        count++;
    });
    
    testBus.publish('test:error');
    
    if (count === 1) {
        console.log('  ✅ PASS: Error in one subscriber does not affect others');
        return true;
    } else {
        console.log(`  ❌ FAIL: Expected count 1, got ${count}`);
        return false;
    }
}

function testSubscriberCount() {
    console.log('🧪 Test: Subscriber Count');
    
    const testBus = new EventBus();
    
    testBus.subscribe('test:count', () => {});
    testBus.subscribe('test:count', () => {});
    testBus.subscribe('test:count', () => {});
    
    const count = testBus.getSubscriberCount('test:count');
    const hasSubscribers = testBus.hasSubscribers('test:count');
    const noSubscribers = testBus.hasSubscribers('nonexistent:event');
    
    if (count === 3 && hasSubscribers && !noSubscribers) {
        console.log('  ✅ PASS: Subscriber count and check work correctly');
        return true;
    } else {
        console.log(`  ❌ FAIL: Count=${count}, hasSubscribers=${hasSubscribers}, noSubscribers=${noSubscribers}`);
        return false;
    }
}

function testEventHistory() {
    console.log('🧪 Test: Event History');
    
    const testBus = new EventBus();
    
    testBus.subscribe('test:history', () => {});
    testBus.publish('test:history', { data: 'test1' });
    testBus.publish('test:history', { data: 'test2' });
    
    const history = testBus.getHistory(2);
    
    if (history.length === 2 && 
        history[0].event === 'test:history' &&
        history[1].event === 'test:history') {
        console.log('  ✅ PASS: Event history tracked correctly');
        return true;
    } else {
        console.log('  ❌ FAIL: Event history not working');
        return false;
    }
}

function testClearSubscriptions() {
    console.log('🧪 Test: Clear All Subscriptions');
    
    const testBus = new EventBus();
    let count = 0;
    
    testBus.subscribe('test:clear', () => count++);
    testBus.subscribe('test:clear2', () => count++);
    
    testBus.clear();
    
    testBus.publish('test:clear');
    testBus.publish('test:clear2');
    
    if (count === 0) {
        console.log('  ✅ PASS: All subscriptions cleared');
        return true;
    } else {
        console.log(`  ❌ FAIL: Expected 0 calls after clear, got ${count}`);
        return false;
    }
}

function testInvalidCallback() {
    console.log('🧪 Test: Invalid Callback Handling');
    
    const testBus = new EventBus();
    let errorThrown = false;
    
    try {
        testBus.subscribe('test:invalid', 'not a function');
    } catch (error) {
        errorThrown = true;
    }
    
    if (errorThrown) {
        console.log('  ✅ PASS: Invalid callback throws error');
        return true;
    } else {
        console.log('  ❌ FAIL: Should throw error for non-function callback');
        return false;
    }
}

function testEventConstants() {
    console.log('🧪 Test: Event Constants Available');
    
    // Check that Events constants are defined
    const hasConstants = Events && 
        Events.PAGE_SWITCHED &&
        Events.SEARCH_COMPLETED &&
        Events.FILTERS_UPDATED;
    
    if (hasConstants) {
        console.log('  ✅ PASS: Event constants are defined');
        return true;
    } else {
        console.log('  ❌ FAIL: Event constants missing');
        return false;
    }
}

// Run tests if executed directly
if (typeof window !== 'undefined' && window.location.search.includes('test=eventbus')) {
    runEventBusTests();
}
