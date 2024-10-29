import subprocess
import time
from datetime import datetime

# gets memory usage using 'free -m'
def get_memory_usage():
    result = subprocess.run(['free', '-m'], capture_output=True, text=True)
    return result.stdout

# logs memory usage to a file at regular intervals and stops after 2 hours
def log_memory_usage(log_file='memory_usage_log5.txt', interval=60, run_duration=7200):
    start_time = time.time()

    with open(log_file, 'a') as file:
        while True:
            elapsed_time = time.time() - start_time

            if elapsed_time >= run_duration:
                print("2 hours have passed. Stopping the logging process.")
                break

            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            memory_usage = get_memory_usage()

            file.write(f"Timestamp: {timestamp}\n")
            file.write(memory_usage)
            file.write("\n" + "-"*50 + "\n")

            print(f"Logged memory usage at {timestamp}")
            time.sleep(interval)

if __name__ == "__main__":
    log_memory_usage(interval=30)
