---
layout: post
title: "Concurrent Programming Paradigms"
date: 2025-05-11 00:58:21
tags:
  - go
  - concurrency
  - programming
  - multithreading
description: 'An exploration of different concurrent programming paradigms, their implementation patterns, advantages, and trade-offs in modern software development.'
---

## Introduction

Concurrent programming is a technique that allows multiple parts of a program to execute simultaneously. In modern multi-core processor architectures, concurrent programming is crucial for improving program performance, responsiveness, and resource utilization. However, the concurrent environment also introduces new challenges, such as race conditions and deadlocks. This tutorial will introduce several mainstream concurrent programming paradigms, helping you understand their core ideas, advantages, disadvantages, and applicable scenarios.

## 1. Threads and Locks

This is the most traditional and fundamental concurrency model.

* **Core Idea**:
    * **Threads**: A thread is the smallest unit of processing that can be scheduled by an operating system. A process can contain multiple threads, which share the process's memory space (like the heap) but each has its own stack space and program counter.
    * **Shared Memory**: Multiple threads can directly read and write to the same memory area, which is their primary way of communicating and sharing data.
    * **Locks**: Due to shared memory, conflicts can easily occur when multiple threads modify shared data simultaneously, leading to data inconsistency, known as a **Race Condition**. Locks (such as Mutexes, Semaphores, ReadWrite Locks) are synchronization mechanisms used to protect critical sections (code segments accessing shared resources), ensuring that only one thread can access the resource at a time.

* **How it Works**:
    1.  A thread attempts to acquire a lock before entering a critical section.
    2.  If the lock is not held by another thread, the current thread acquires the lock and enters the critical section to perform operations.
    3.  If the lock is held by another thread, the current thread blocks and waits until the lock is released.
    4.  After completing operations in the critical section, the thread releases the lock so that other waiting threads can acquire it.

* **Advantages**:
    * Relatively intuitive concept, easy to understand and get started with.
    * Shared memory can lead to efficient data exchange in some cases.

* **Disadvantages**:
    * **Deadlock**: Occurs when multiple threads circularly wait for locks held by each other, causing all threads to be unable to proceed.
    * **Livelock**: Threads continuously retry an operation but make no progress due to interference from other threads.
    * **Starvation**: One or more threads are perpetually denied necessary resources (like a lock) due to priority or other reasons.
    * **Lock Contention**: Significant performance overhead when many threads compete for the same lock.
    * **Difficult to Debug and Reason About**: Concurrent defects are often hard to reproduce and locate due to the interleaved execution of threads and shared state.
    * **Limited Scalability**: Coarse-grained locks limit parallelism, while fine-grained locks increase complexity and the risk of deadlock.

* **Code Example (Java)**:
    A simple shared counter incremented by multiple threads, protected by a `ReentrantLock`.

    ```java
    import java.util.concurrent.locks.Lock;
    import java.util.concurrent.locks.ReentrantLock;

    class SharedCounter {
        private int count = 0;
        private final Lock lock = new ReentrantLock();

        public void increment() {
            lock.lock(); // Acquire the lock
            try {
                count++;
                System.out.println(Thread.currentThread().getName() + " incremented count to: " + count);
            } finally {
                lock.unlock(); // Release the lock in a finally block
            }
        }

        public int getCount() {
            lock.lock();
            try {
                return count;
            } finally {
                lock.unlock();
            }
        }
    }

    public class ThreadsAndLocksExample {
        public static void main(String[] args) throws InterruptedException {
            SharedCounter sharedCounter = new SharedCounter();

            Thread t1 = new Thread(() -> {
                for (int i = 0; i < 5; i++) {
                    sharedCounter.increment();
                    try {
                        Thread.sleep(10); // Simulate some work
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }, "Thread-1");

            Thread t2 = new Thread(() -> {
                for (int i = 0; i < 5; i++) {
                    sharedCounter.increment();
                    try {
                        Thread.sleep(10); // Simulate some work
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }, "Thread-2");

            t1.start();
            t2.start();

            t1.join();
            t2.join();

            System.out.println("Final count: " + sharedCounter.getCount());
        }
    }
    ```

## 2. Actor Model

The Actor Model provides a higher-level abstraction for handling concurrency.

* **Core Idea**:
    * **Actor**: An actor is the fundamental unit of concurrency. Each actor is an independent computational entity with its own private state and behavior.
    * **No Shared State**: Actors do not share memory. This is a fundamental difference from the Threads and Locks model.
    * **Message Passing**: Actors communicate by asynchronously sending and receiving messages. Sending a message is non-blocking.
    * **Mailbox**: Each actor has a mailbox (message queue) to store received messages. Actors process messages from their mailbox sequentially.
    * **Behavior Change**: When processing a message, an actor can change its internal state, send messages to other actors, or create new actors.

* **How it Works**:
    1.  An actor (Sender) sends a message to the address of another actor (Receiver).
    2.  The message is placed in the Receiver's mailbox queue.
    3.  The Receiver retrieves a message from its mailbox for processing. When processing a message, it can:
        * Update its internal state.
        * Send messages to other actors (including itself or the Sender).
        * Create new actors.
        * Change its behavior for processing subsequent messages.

* **Advantages**:
    * **Avoids Race Conditions and Deadlocks**: Fundamentally avoids common concurrency problems related to locks by not having shared state.
    * **High Concurrency**: Actors run independently and can utilize multi-core processors effectively.
    * **Fault Tolerance**: The isolation of actors allows errors to be confined within a single actor and handled through supervision mechanisms, making it easier to build highly available distributed systems.
    * **Easier to Reason About Code**: Each actor's behavior is based on its received messages and internal state, making concurrent logic less complex.

* **Disadvantages**:
    * **Message Passing Overhead**: While avoiding lock overhead, message serialization, deserialization, and delivery also have costs.
    * **State Management**: All state is encapsulated within actors. Scenarios requiring a global view or coordination across multiple actors can be more complex to design.
    * **Debugging Can Be Complex**: Tracing message flows across multiple actors can be challenging.

* **Typical Implementations**: Erlang/OTP, Akka (Scala/Java), Orleans (.NET)

* **Code Example (Python - conceptual)**:
    A simple Python implementation of an actor-like system.

    ```python
    import threading
    import queue
    import time

    class Actor:
        def __init__(self, name):
            self.name = name
            self._mailbox = queue.Queue()
            self._thread = threading.Thread(target=self._run, daemon=True)
            self._active = True
            self._state = {} # Actor's private state

        def start(self):
            self._thread.start()
            print(f"Actor {self.name} started.")

        def stop(self):
            self._active = False
            self.send({"type": "_stop"}) # Send a special message to unblock receive
            self._thread.join(timeout=2)
            print(f"Actor {self.name} stopped.")

        def send(self, message):
            self._mailbox.put(message)

        def _run(self):
            while self._active:
                try:
                    # Wait for a message, with a timeout to check _active flag
                    message = self._mailbox.get(timeout=0.1)
                    if message.get("type") == "_stop" and not self._active:
                        break
                    self.receive(message)
                except queue.Empty:
                    continue # No message, continue loop to check _active
                except Exception as e:
                    print(f"Actor {self.name} encountered an error: {e}")
                    # In a real actor system, this might involve a supervisor
            print(f"Actor {self.name} event loop finished.")


        def receive(self, message):
            """To be implemented by subclasses to define actor behavior."""
            print(f"Actor {self.name} received (but did not handle): {message}")


    class PingActor(Actor):
        def __init__(self, name, pong_actor_ref=None):
            super().__init__(name)
            self.pong_actor = pong_actor_ref
            self._state['pings_sent'] = 0

        def set_pong_actor(self, pong_actor_ref):
            self.pong_actor = pong_actor_ref

        def receive(self, message):
            msg_type = message.get("type")
            if msg_type == "start_pinging":
                count = message.get("count", 3)
                print(f"{self.name}: Received start_pinging command for {count} pings.")
                for i in range(count):
                    if not self.pong_actor:
                        print(f"{self.name}: No pong actor configured to send ping to.")
                        break
                    ping_msg = {"type": "ping", "sender": self, "id": i}
                    print(f"{self.name}: Sending PING {i} to {self.pong_actor.name}")
                    self.pong_actor.send(ping_msg)
                    self._state['pings_sent'] += 1
                    time.sleep(0.5) # Simulate some work or delay
            elif msg_type == "pong":
                print(f"{self.name}: Received PONG {message.get('id')} from {message.get('sender_name')}")
            else:
                super().receive(message)


    class PongActor(Actor):
        def receive(self, message):
            msg_type = message.get("type")
            if msg_type == "ping":
                sender_actor = message.get("sender")
                ping_id = message.get("id")
                print(f"{self.name}: Received PING {ping_id} from {sender_actor.name}. Sending PONG.")
                sender_actor.send({"type": "pong", "sender_name": self.name, "id": ping_id})
            else:
                super().receive(message)

    if __name__ == "__main__":
        pong_actor = PongActor("Ponger")
        ping_actor = PingActor("Pinger")

        ping_actor.set_pong_actor(pong_actor) # Dependency injection

        ping_actor.start()
        pong_actor.start()

        # Send a message to start the interaction
        ping_actor.send({"type": "start_pinging", "count": 3})

        time.sleep(5) # Let actors run for a bit

        ping_actor.stop()
        pong_actor.stop()
        print("Main thread finished.")
    ```

## 3. Communicating Sequential Processes (CSP)

CSP is another paradigm that emphasizes message passing rather than shared memory.

* **Core Idea**:
    * **Processes**: Independent concurrently executing units that do not share state. (The "process" here is a concept from CSP theory and might map to threads or coroutines in actual programming languages).
    * **Channels**: Processes communicate through explicit channels. Channels are typed and used to pass messages of a specific type.
    * **Synchronous Communication**: A core feature of CSP is that its primitive communication is synchronous. When a process sends a message on a channel, it blocks until another process receives the message from that channel. Conversely, a receive operation also blocks until a message is sent to the channel. This ensures a "handshake" for message delivery. (Many actual implementations also support buffered, asynchronous channels).
    * **Choice/Select**: Processes can wait for one of several communication events to occur (e.g., receiving from multiple channels or sending to multiple channels) and perform an action based on the event that becomes ready first.

* **How it Works**:
    1.  Process A prepares to send data `X` on channel `C`.
    2.  Process B prepares to receive data from channel `C`.
    3.  Only when both A and B are ready does the data `X` pass from A to B. The process that arrives first will block.
    4.  After communication is complete, both processes continue execution.
    5.  The `select` statement allows a process to monitor multiple channels and operate on the first one that becomes available, avoiding blockage by waiting on a single channel.

* **Advantages**:
    * **Avoids Race Conditions**: Reduces the likelihood of race conditions by not sharing state and using explicit communication channels.
    * **Clear Concurrent Structure**: Concurrent interactions are explicitly defined through channels, making them easier to understand and analyze.
    * **Easier to Reason About Deadlocks**: Due to the explicitness and synchronicity of communication (in the basic model), deadlock analysis is relatively straightforward.
    * **Good Composability**: CSP components (processes and channels) are easy to combine into more complex concurrent systems.

* **Disadvantages**:
    * **Potential for Blocking**: Synchronous communication can lead to unnecessary blocking, affecting performance unless carefully designed or buffered channels are used.
    * **Channel Management**: Requires management of channel creation, passing, and lifecycle.
    * **Comparison with Actor Model**: CSP typically focuses more on the orchestration and synchronization of communication, while the Actor Model focuses more on the state and behavior of independent entities.

* **Typical Implementations**: Go (goroutines and channels), Occam, JCSP (Java)

* **Code Example (Go)**:
    Two goroutines communicating over a channel. One sends data, the other receives.

    ```go
    package main

    import (
    	"fmt"
    	"time"
    )

    // Sender function: sends a series of messages to a channel
    func sender(ch chan string, name string) {
    	messages := []string{"Hello", "from", name, "!"}
    	for _, msg := range messages {
    		fmt.Printf("%s: sending '%s'\n", name, msg)
    		ch <- msg // Send message to channel (blocks until receiver is ready)
    		time.Sleep(50 * time.Millisecond) // Simulate some work
    	}
    	close(ch) // Close the channel to signal no more messages
    	fmt.Printf("%s: done sending and closed channel.\n", name)
    }

    // Receiver function: receives messages from a channel
    func receiver(ch chan string, name string) {
    	fmt.Printf("%s: waiting for messages...\n", name)
    	// Loop continues until the channel is closed and all values have been received
    	for msg := range ch {
    		fmt.Printf("%s: received '%s'\n", name, msg)
    		time.Sleep(100 * time.Millisecond) // Simulate processing
    	}
    	fmt.Printf("%s: channel closed, done receiving.\n", name)
    }

    func main() {
    	// Create an unbuffered channel for strings.
    	// Unbuffered channels require sender and receiver to be ready simultaneously (synchronous).
    	messageChannel := make(chan string)

    	fmt.Println("Starting CSP example with unbuffered channel...")

    	// Start the sender and receiver goroutines
    	go sender(messageChannel, "SenderGoroutine")
    	go receiver(messageChannel, "ReceiverGoroutine")

    	// Let the goroutines run for a while.
    	// In a real application, you'd use sync.WaitGroup or other mechanisms
    	// to wait for goroutines to complete.
    	// For this example, a simple sleep is enough because the receiver
    	// will terminate when the channel is closed by the sender,
    	// and the main function will exit after that.
    	time.Sleep(2 * time.Second) // Allow time for all operations

    	fmt.Println("Main function finished.")
    }
    ```

## 4. Lock-Free Programming

Lock-free programming is a technique for implementing multi-threaded synchronization without using locks (like mutexes). Its goal is to ensure that if one or more threads are executing an operation, the system as a whole can still make progress even if other threads are suspended.

* **Core Idea**:
    * **Atomic Operations**: Relies on hardware-provided atomic instructions (e.g., Compare-And-Swap (CAS), Fetch-And-Add, Load-Linked/Store-Conditional). These instructions can read, modify, and write to a memory location atomically (uninterruptibly).
    * **CAS (Compare-And-Swap)**: A key atomic operation. It takes three arguments: a memory address `V`, an expected old value `A`, and a new value `B`. Only if the current value of `V` is equal to `A` will the value of `V` be updated to `B`, and the operation returns success; otherwise, `V` is not modified, and the operation returns failure.
    * **Data Structure Design**: Lock-free algorithms often involve carefully designed data structures (like lock-free queues, stacks, hash tables) that allow multiple threads to safely access them concurrently without locks.

* **How it Works** (Example of updating a shared variable using CAS):
    1.  A thread reads the current value of the shared variable.
    2.  The thread computes a new value based on this read value.
    3.  The thread uses a CAS operation to attempt to update the shared variable from the read old value to the computed new value.
    4.  If CAS succeeds, the operation is complete.
    5.  If CAS fails (meaning another thread modified the shared variable in the interim), the thread typically retries the process (re-read, re-compute, re-attempt CAS).

* **Levels**:
    * **Wait-free**: The strongest guarantee. Every thread is guaranteed to complete its operation in a finite number of its own steps, regardless of the speed or suspension of other threads.
    * **Lock-free**: Guarantees that the system as a whole always has some thread making progress. Individual threads might retry due to the activity of other threads but will not cause the entire system to stall.
    * **Obstruction-free**: The weakest guarantee. If a thread executes in isolation (i.e., without contention from other threads), it will complete its operation in a finite number of steps.

* **Advantages**:
    * **Avoids Deadlock and Priority Inversion**: Since there are no locks, deadlock or priority inversion problems related to locks do not occur.
    * **Performance Potential under High Concurrency**: In highly contended scenarios, well-designed lock-free algorithms can offer better performance and scalability than lock-based algorithms because they reduce thread blocking and context switching.
    * **Suitable for Interrupt and Signal Handlers**: Very useful in contexts where locks cannot be acquired (e.g., interrupt handlers).

* **Disadvantages**:
    * **Extremely Complex**: Designing and implementing correct lock-free algorithms is very difficult and error-prone. It requires a deep understanding of memory models, compiler optimizations, and hardware atomic instructions.
    * **ABA Problem**: A common pitfall. A memory location's value changes from A to B, and then back to A. A CAS operation that only checks "is the value still A?" might incorrectly assume nothing has changed, leading to data corruption. More complex techniques (like version-tagged pointers) are needed to solve this.
    * **Possibility of Livelock/Starvation**: Although the system as a whole makes progress, individual threads might be unable to complete their operations for a long time due to continuous retries.
    * **Difficult to Debug**: Concurrent defects in lock-free code are very hard to trace and fix.
    * **Performance Not Always Superior**: In low-contention scenarios, the overhead of locks might be small, while the overhead of atomic operations and retry logic in lock-free algorithms might be greater.

* **Code Example (C++)**:
    A lock-free `push` operation for a singly linked list stack using `std::atomic` and `compare_exchange_weak`.

    ```cpp
    #include <iostream>
    #include <atomic>
    #include <thread>
    #include <vector>

    template<typename T>
    class LockFreeStack {
    private:
        struct Node {
            T data;
            Node* next;
            Node(const T& data) : data(data), next(nullptr) {}
        };
        std::atomic<Node*> head; // Atomic pointer to the head of the stack

    public:
        LockFreeStack() : head(nullptr) {}

        void push(const T& data) {
            Node* newNode = new Node(data);
            // Loop until CAS succeeds
            while (true) {
                Node* oldHead = head.load(std::memory_order_relaxed); // Read current head
                newNode->next = oldHead; // New node points to old head
                // Attempt to atomically set head to newNode if head is still oldHead
                if (head.compare_exchange_weak(oldHead, newNode,
                                               std::memory_order_release,
                                               std::memory_order_relaxed)) {
                    // std::cout << "Thread " << std::this_thread::get_id() << " pushed " << data << std::endl;
                    break; // Success
                }
                // If CAS failed, oldHead is updated with the current head. Loop and retry.
                // std::cout << "Thread " << std::this_thread::get_id() << " CAS failed for push, retrying..." << std::endl;
            }
        }

        // Note: A full lock-free pop is more complex due to the ABA problem
        // and memory reclamation issues (how to safely delete popped nodes).
        // This is a simplified example focusing on push.
        // A production-ready lock-free stack would need hazard pointers or epoch-based reclamation.
        T pop() { // Simplified and potentially unsafe pop for demonstration
            while (true) {
                Node* oldHead = head.load(std::memory_order_relaxed);
                if (oldHead == nullptr) {
                    throw std::runtime_error("Stack is empty");
                }
                Node* newHead = oldHead->next;
                if (head.compare_exchange_weak(oldHead, newHead,
                                               std::memory_order_release,
                                               std::memory_order_relaxed)) {
                    T data = oldHead->data;
                    // IMPORTANT: In a real lock-free stack, you cannot simply delete oldHead here
                    // if other threads might still be accessing it. This requires a proper
                    // memory reclamation scheme (e.g., hazard pointers, epoch-based reclamation).
                    // For this example, we'll leak it or assume single-threaded pop for safety.
                    // delete oldHead; // This line is unsafe in a truly concurrent pop.
                    // std::cout << "Thread " << std::this_thread::get_id() << " popped " << data << std::endl;
                    return data;
                }
                // std::cout << "Thread " << std::this_thread::get_id() << " CAS failed for pop, retrying..." << std::endl;
            }
        }

        ~LockFreeStack() {
            // Basic cleanup, not thread-safe if other operations are ongoing
            Node* current = head.load();
            while (current != nullptr) {
                Node* next = current->next;
                delete current;
                current = next;
            }
        }
    };

    void pusher_thread(LockFreeStack<int>& stack, int start_val, int num_elements) {
        for (int i = 0; i < num_elements; ++i) {
            stack.push(start_val + i);
        }
    }

    int main() {
        LockFreeStack<int> stack;

        std::thread t1(pusher_thread, std::ref(stack), 100, 5);
        std::thread t2(pusher_thread, std::ref(stack), 200, 5);

        t1.join();
        t2.join();

        std::cout << "Elements pushed. Attempting to pop (simplified pop):" << std::endl;
        // Popping elements (simplified, not fully safe for concurrent pops from multiple threads)
        // In a real scenario, popping should also be carefully managed or done by a single thread
        // if a safe concurrent pop isn't implemented.
        try {
            for (int i = 0; i < 10; ++i) { // Try to pop 10 elements
                 std::cout << "Popped: " << stack.pop() << std::endl;
            }
        } catch (const std::runtime_error& e) {
            std::cout << "Exception during pop: " << e.what() << std::endl;
        }

        return 0;
    }
    ```

## 5. Software Transactional Memory (STM)

Software Transactional Memory borrows the concept of transactions from databases, attempting to group a series of memory operations into an atomic unit.

* **Core Idea**: Organize a series of read/write operations on shared memory into "transactions." These transactions either complete atomically (commit) or are entirely undone (rollback) if a conflict occurs, ensuring data consistency. Programmers can optimistically execute sequences of operations, and the STM system is responsible for detecting and resolving conflicts.

* **How it Works**:
    1.  **Begin Transaction**: A thread declares the start of a new transaction.
    2.  **Execute Operations**: During the transaction, the thread performs reads and writes to shared memory locations. These operations are typically recorded in a thread-local transaction log rather than directly modifying main memory.
    3.  **Attempt Commit**: When the thread completes all operations in the transaction, it attempts to commit the transaction.
    4.  **Conflict Detection (Validation)**: The STM runtime system checks if the current transaction's read-set (memory locations read) and write-set (memory locations intended for writing) conflict with other concurrently executing, committed, or committing transactions.
    5.  **Commit or Rollback**:
        * If there are no conflicts, the transaction commits successfully. Write operations from the transaction log are atomically applied to main memory.
        * If a conflict is detected (e.g., a value read by the current transaction has been modified by another transaction, or a location the current transaction wants to write to has been written by another transaction), the current transaction rolls back. All changes in the transaction log are discarded, and the thread typically retries the entire transaction after a delay.

* **Advantages**:
    * **Simplified Concurrency Control**: For programmers, STM hides complex lock management. Developers can focus on defining transaction boundaries rather than manually handling lock acquisition and release, reducing the risk of deadlocks and race conditions.
    * **Composability**: Transactions are generally easier to compose than locks. Combining two modules that require locks can lead to complex lock ordering issues or deadlocks, whereas the composition of transactions is often more natural.
    * **Optimistic Concurrency**: Suitable for scenarios where read operations far outnumber write operations, or where actual conflicts are infrequent, potentially yielding good performance.

* **Disadvantages**:
    * **Performance Overhead**: Transaction logging, conflict detection, and potential rollback/retry introduce runtime overhead. For high-conflict or long transactions, performance might be worse than fine-grained locks.
    * **Interaction with Non-Transactional Code/IO**: Performing irreversible operations (like I/O) within a transaction or interacting with code not managed by STM is tricky. How these operations are handled if a transaction rolls back is a challenge.
    * **Implementation Complexity**: Efficient and correct STM systems are inherently complex to build.
    * **Debugging**: Debugging concurrency issues (like livelocks, unexpected rollbacks) in STM applications can be challenging.

* **Typical Implementations/Language Support**: Haskell (GHC STM), Clojure (Refs), Scala (Akka STM, ZIO STM), some experimental C++ and Java libraries.

* **Code Example (Haskell)**:
    Transferring a value between two `TVar`s (transactional variables) atomically.

    ```haskell
    import Control.Concurrent.STM
    import Control.Concurrent (forkIO, threadDelay)
    import Text.Printf (printf)

    -- Function to atomically transfer an amount from one TVar to another
    transfer :: TVar Int -> TVar Int -> Int -> STM ()
    transfer fromAccount toAccount amount = do
        currentFrom <- readTVar fromAccount
        if currentFrom < amount
        then retry -- Not enough funds, transaction retries automatically when a involved TVar changes
        else do
            writeTVar fromAccount (currentFrom - amount)
            currentTo <- readTVar toAccount
            writeTVar toAccount (currentTo + amount)
            -- The following is just for demonstration within STM, usually side effects are outside
            -- For real logging, you'd typically return a value or status from STM
            -- and perform the IO action outside the transaction.
            -- However, for simple trace, this can be done if using unsafeIOToSTM or similar,
            // but it's generally discouraged for pure STM.
            -- For this example, let's assume we just perform the logic.
            -- The print statements will be outside the STM block in the main IO.
            return ()


    main :: IO ()
    main = do
        accountA <- newTVarIO 100 -- Account A starts with 100
        accountB <- newTVarIO 50  -- Account B starts with 50

        putStrLn "Initial balances:"
        balanceA_initial <- readTVarIO accountA
        balanceB_initial <- readTVarIO accountB
        printf "Account A: %d, Account B: %d\n" balanceA_initial balanceB_initial

        -- Thread 1: Tries to transfer 30 from A to B
        forkIO $ do
            atomically $ transfer accountA accountB 30
            putStrLn "Thread 1: Transferred 30 from A to B successfully."

        -- Thread 2: Tries to transfer 80 from A to B
        -- This might initially fail if Thread 1 hasn't run yet, or if funds are insufficient
        -- after Thread 1's transfer. STM's `retry` handles this.
        forkIO $ do
            atomically $ transfer accountA accountB 80
            putStrLn "Thread 2: Transferred 80 from A to B successfully."

        -- Thread 3: Tries to transfer 10 from B to A
        forkIO $ do
            atomically $ transfer accountB accountA 10
            putStrLn "Thread 3: Transferred 10 from B to A successfully."


        -- Give threads some time to execute
        threadDelay 1000000 -- 1 second

        putStrLn "\nFinal balances:"
        balanceA_final <- readTVarIO accountA
        balanceB_final <- readTVarIO accountB
        printf "Account A: %d, Account B: %d\n" balanceA_final balanceB_final

        -- Expected outcome (depends on scheduling, but STM ensures consistency):
        -- Initial: A=100, B=50
        -- T1: A -> B (30) => A=70, B=80
        -- T3: B -> A (10) => A=80, B=70
        -- T2: A -> B (80) => This should ideally fail or retry until A has enough (e.g. if T3 runs first)
        -- If T1 (A=70, B=80), then T2 wants 80 from A. A has 70. T2 retries.
        -- If T3 runs (A=80, B=70), then T2 wants 80 from A. A has 80. T2 succeeds (A=0, B=150).
        -- A possible final state if T1, T3, T2 run in some order: A=0, B=150
        -- If T1, T2 (fails/retries), T3 runs, then T2 might succeed.
        -- The key is atomicity and consistency.
        -- A=100, B=50
        -- T1: A -= 30 (70), B += 30 (80)
        -- T2: A -= 80. A is 70. Retry.
        -- T3: B -= 10 (70), A += 10 (80)
        -- Now T2 retries: A is 80. A -= 80 (0), B += 80 (150).
        -- Final: A=0, B=150
    ```

## 6. Dataflow Programming

Dataflow programming is a paradigm where computation is driven by the availability of data.

* **Core Idea**: A program is modeled as a directed graph where nodes represent computational units (operations or functions) and edges represent the flow of data between nodes. A node executes ("fires") only when all its required input data is available.

* **How it Works**:
    1.  **Define Dataflow Graph**: Developers define computational nodes and the data dependencies between them.
    2.  **Data Injection**: Initial data or events are fed into the source nodes of the graph.
    3.  **Node Activation**: When all input edges of a node have data (or "tokens") available, the node is activated.
    4.  **Execution and Output**: The activated node performs its specified computation and sends the results to its output edges, which then become inputs for downstream nodes.
    5.  **Parallel Execution**: Multiple nodes without direct data dependencies can execute concurrently as long as their input data is ready. Data flows asynchronously through the graph.

* **Advantages**:
    * **Inherent Parallelism**: Explicit data dependencies make the identification and utilization of parallel execution intuitive.
    * **Modularity and Reusability**: Nodes are often designed as independent, functionally specific components, making them easy to reuse and compose.
    * **Suitable for Stream Processing and Reactive Systems**: Well-suited for building systems that need to process continuous data streams or react to events.
    * **Visualization**: Dataflow graphs provide an intuitive way to understand and design complex processing pipelines.

* **Disadvantages**:
    * **Not Suitable for All Problems**: For problems with complex control flow, extensive global state, or tightly synchronized iterative algorithms, the dataflow model might not be the most natural representation.
    * **State Management**: Managing persistent state or shared state between nodes in a pure dataflow model can be complex and often requires additional mechanisms.
    * **Debugging**: Tracing data flow paths in complex graphs and locating errors can be challenging, especially in large-scale parallel systems.
    * **Cyclic Dependencies**: Handling cycles (feedback loops) in the graph requires special consideration to avoid deadlocks or infinite execution.

* **Typical Implementations/Applications**: TensorFlow, PyTorch (dynamic graphs), Apache Beam, Apache Flink, Apache NiFi, LabVIEW, Max/MSP, Reactive Extensions (RxJava, RxJS, RxSwift, etc.).

* **Code Example (Conceptual Python)**:
    A very simple conceptual dataflow system with producer, processor, and consumer nodes using queues.

    ```python
    import queue
    import threading
    import time

    # Node base class (conceptual)
    class DataflowNode(threading.Thread):
        def __init__(self, name, input_queues=None, output_queues=None):
            super().__init__(daemon=True)
            self.name = name
            self.input_queues = input_queues if input_queues else []
            self.output_queues = output_queues if output_queues else []
            self._running = True

        def process(self, inputs):
            # To be implemented by subclasses
            raise NotImplementedError

        def run(self):
            print(f"Node {self.name} started.")
            while self._running:
                try:
                    # For simplicity, this example assumes a single input queue for nodes that have inputs.
                    # A real system would handle multiple input queues and more complex trigger conditions.
                    if self.input_queues:
                        inputs = []
                        # Attempt to get data from all input queues (blocking)
                        # This is a simplified "all inputs ready" condition.
                        for q_in in self.input_queues:
                            data_item = q_in.get(timeout=0.1) # Timeout to allow checking self._running
                            inputs.append(data_item)
                            # q_in.task_done() # If using JoinableQueue

                        results = self.process(inputs) # Process the collected inputs

                        if results is not None: # Could be single or multiple results
                            if not isinstance(results, list) and self.output_queues:
                                results = [results] # Make it a list if single output for consistency

                            for i, q_out in enumerate(self.output_queues):
                                if i < len(results):
                                    q_out.put(results[i])
                    else: # Source node, no inputs, just produces data
                        results = self.process(None)
                        if results is not None:
                            if not isinstance(results, list) and self.output_queues:
                                results = [results]
                            for i, q_out in enumerate(self.output_queues):
                                if i < len(results):
                                    q_out.put(results[i])
                        time.sleep(0.5) # Source nodes might produce data periodically

                except queue.Empty:
                    continue # Timeout occurred, check self._running and retry
                except Exception as e:
                    if self._running: # Only print if not shutting down
                        print(f"Node {self.name} error: {e}")
                    break # Stop on error or if not running
            print(f"Node {self.name} finished.")

        def stop(self):
            self._running = False
            # Put dummy data to unblock queues if nodes are waiting
            for q in self.input_queues:
                try: q.put_nowait(None)
                except queue.Full: pass
            for q in self.output_queues:
                try: q.put_nowait(None)
                except queue.Full: pass


    class ProducerNode(DataflowNode):
        def __init__(self, name, output_queue):
            super().__init__(name, output_queues=[output_queue])
            self.counter = 0

        def process(self, inputs): # inputs will be None
            if self.counter < 5:
                data = f"Data_{self.counter}"
                print(f"{self.name}: Producing {data}")
                self.counter += 1
                time.sleep(0.3) # Simulate work
                return data
            else:
                print(f"{self.name}: Finished producing.")
                self.stop() # Stop itself after producing enough
                return None # Signal no more data

    class ProcessingNode(DataflowNode):
        def __init__(self, name, input_queue, output_queue):
            super().__init__(name, input_queues=[input_queue], output_queues=[output_queue])

        def process(self, inputs):
            data_item = inputs[0] # Expecting single input from the list
            if data_item is None and not self._running: return None # Shutdown signal

            processed_data = f"Processed({data_item})"
            print(f"{self.name}: Processing {data_item} -> {processed_data}")
            time.sleep(0.5) # Simulate work
            return processed_data

    class ConsumerNode(DataflowNode):
        def __init__(self, name, input_queue):
            super().__init__(name, input_queues=[input_queue])
            self.consumed_count = 0

        def process(self, inputs):
            data_item = inputs[0]
            if data_item is None and not self._running: return None # Shutdown signal

            print(f"{self.name}: Consuming {data_item}")
            self.consumed_count += 1
            time.sleep(0.2) # Simulate work
            if self.consumed_count >= 5: # Example condition to stop
                print(f"{self.name}: Consumed enough, stopping.")
                self.stop()
            return None # Consumer doesn't produce output for other nodes in this example

    if __name__ == "__main__":
        q1 = queue.Queue() # Producer to Processor
        q2 = queue.Queue() # Processor to Consumer

        producer = ProducerNode("Producer", q1)
        processor = ProcessingNode("Processor", q1, q2)
        consumer = ConsumerNode("Consumer", q2)

        nodes = [producer, processor, consumer]

        for node in nodes:
            node.start()

        # Wait for nodes to finish (or a timeout)
        # A more robust way would be to join them, but producer/consumer stop themselves.
        # Processor will stop if its input queue gets a None from a stopping producer,
        # or due to timeout and self._running becoming false.
        time.sleep(10) # Let it run for a while

        print("\nMain: Attempting to stop any remaining nodes...")
        for node in nodes:
            if node.is_alive():
                 node.stop()

        for node in nodes:
            if node.is_alive():
                node.join(timeout=2) # Wait for threads to finish

        print("Main: Dataflow example finished.")
    ```

## 7. Other Related Concepts

Besides the main concurrency paradigms mentioned above, some important concepts and technologies are closely related to concurrent programming:

### Coroutines/Fibers

* **Core Idea**: User-level lightweight "threads" whose creation, scheduling, and switching are controlled by the application or language runtime, not the OS kernel. Coroutines can cooperatively suspend (yield) their execution and resume later from the suspension point.

* **Characteristics**:
    * **Lightweight**: The overhead of creating and context-switching coroutines is much lower than OS threads, allowing for the creation of thousands or even millions of coroutines.
    * **Cooperative Scheduling**: A coroutine typically runs until it explicitly yields control or waits for an asynchronous operation to complete. This avoids many complexities associated with preemptive scheduling (like needing locks for very short critical sections).
    * **Simplified Asynchronous Programming**: Often combined with `async/await` syntactic sugar, enabling developers to write non-blocking asynchronous code in a seemingly synchronous style.

* **Relationship with Paradigms**: Coroutines themselves are more of an implementation mechanism for concurrent tasks rather than a complete concurrent interaction model like Actors or CSP. They are often used to efficiently implement actors in actor systems, processes in CSP models, or to build highly concurrent network servers and applications. Go's Goroutines are a famous example of coroutines.

* **Code Example (Python `async/await`)**:

    ```python
    import asyncio
    import time

    async def say_after(delay, what):
        """Coroutine that waits for 'delay' seconds then prints 'what'."""
        print(f"[{time.strftime('%X')}] {what}: starting, will wait for {delay}s...")
        await asyncio.sleep(delay) # Non-blocking sleep; yields control
        print(f"[{time.strftime('%X')}] {what}: ... finished waiting and printing!")
        return f"{what} is done"

    async def main_coroutine():
        print(f"[{time.strftime('%X')}] Main coroutine started.")

        # Create tasks to run coroutines concurrently
        task1 = asyncio.create_task(say_after(2, "Hello"))
        task2 = asyncio.create_task(say_after(1, "World"))

        print(f"[{time.strftime('%X')}] Tasks created. Waiting for them to complete...")

        # Wait for both tasks to complete and get their results
        # await waits for the coroutine/task to finish
        result1 = await task1
        result2 = await task2

        print(f"[{time.strftime('%X')}] Result from task1: {result1}")
        print(f"[{time.strftime('%X')}] Result from task2: {result2}")
        print(f"[{time.strftime('%X')}] Main coroutine finished.")

    if __name__ == "__main__":
        # In Python, asyncio.run() is used to start the async event loop
        # and run the main async function.
        asyncio.run(main_coroutine())
    ```

### Parallel Functional Programming

* **Core Idea**: Leverage the features of functional programming languages (especially pure functions and immutable data) to simplify the development of parallel and concurrent programs.

* **Characteristics**:
    * **Pure Functions**: The output of a pure function is determined solely by its inputs, and it has no observable side effects (like modifying global variables or performing I/O). This makes them safe to execute at any time, in any order, or in parallel, as they do not interfere with each other.
    * **Immutability**: Data, once created, cannot be modified. When "modification" is needed, a new copy of the data with the changes is actually created. Immutability eliminates race conditions caused by concurrent access to shared mutable data, thus often obviating the need for locks.
    * **Easy Parallelization**: Due to the absence of side effects and shared mutable state, many functional operations (like `map`, `filter`, `reduce` applied to large datasets) can be easily and automatically parallelized.

* **Application**: This style is very useful when processing large amounts of data (e.g., in big data processing frameworks like MapReduce, Apache Spark) or building highly reliable concurrent systems. Languages like Haskell, Scala, Clojure, and F# provide strong support for functional programming and encourage this approach to concurrency.

* **Code Example (Python - conceptual `parallel_map`)**:
    Using `multiprocessing.Pool().map()` to apply a function to a list of items in parallel.

    ```python
    import multiprocessing
    import time
    import os

    # A simple function that simulates some CPU-bound work
    def square_number(n):
        # Simulate work
        # For truly CPU-bound tasks, this would be actual computation
        # For IO-bound, threading might be better due to GIL in CPython
        start_time = time.time()
        # A dummy computation loop
        for _ in range(10**6): # Adjust loop count based on CPU speed for noticeable delay
            pass
        end_time = time.time()
        duration = end_time - start_time
        # print(f"Process {os.getpid()}: Squaring {n}, took {duration:.4f}s")
        return n * n

    if __name__ == "__main__":
        # This check is important for multiprocessing on Windows and some other setups
        multiprocessing.freeze_support()

        data = list(range(1, 11)) # Data to process: numbers from 1 to 10
        print(f"Original data: {data}")

        start_total_time = time.time()

        # Using multiprocessing.Pool to parallelize the map operation
        # The number of worker processes in the pool defaults to os.cpu_count().
        with multiprocessing.Pool() as pool:
            print(f"Starting parallel map with {pool._processes} worker processes...")
            # 'map' applies 'square_number' to each item in 'data' in parallel
            # It blocks until all results are ready.
            results = pool.map(square_number, data)

        end_total_time = time.time()
        total_duration = end_total_time - start_total_time

        print(f"Squared results (parallel): {results}")
        print(f"Total time for parallel map: {total_duration:.4f}s")

        # For comparison, a sequential map:
        start_seq_time = time.time()
        sequential_results = [square_number(x) for x in data]
        end_seq_time = time.time()
        seq_duration = end_seq_time - start_seq_time

        print(f"Squared results (sequential): {sequential_results}")
        print(f"Total time for sequential map: {seq_duration:.4f}s")

        # Note: For very small tasks, the overhead of multiprocessing
        # (creating processes, inter-process communication) might outweigh the benefits.
        # This example is more illustrative for tasks with non-trivial computation time.
    ```

## Conclusion

Choosing which concurrent programming paradigm to use depends on specific application requirements, team familiarity, and the type of problem being solved.

* **Threads and Locks**: Suitable for relatively simple scenarios with clear shared data needs, but requires very careful handling of synchronization issues.
* **Actor Model**: Ideal for systems requiring high concurrency, fault tolerance, and state isolation, such as telecommunications, game servers, and large-scale parallel processing.
* **CSP**: Well-suited for scenarios that need clearly defined concurrent flows and communication protocols; the success of Go demonstrates its utility in modern systems programming.
* **Lock-Free Programming**: Typically used for implementing low-level libraries or core components with extreme performance requirements; generally not recommended for broad application-level use without substantial expertise.
* **Software Transactional Memory (STM)**: Offers a higher-level abstraction than locks, aiming to simplify shared-memory concurrency, but has trade-offs in performance and interaction with external systems.
* **Dataflow Programming**: Excellent for inherently parallel, event-based, or stream-processing tasks, providing a clear way to express data dependencies and processing pipelines.

In practice, these paradigms may also be mixed, or implemented efficiently using mechanisms like coroutines. Understanding their respective principles and trade-offs will help you build more robust and efficient concurrent applications.