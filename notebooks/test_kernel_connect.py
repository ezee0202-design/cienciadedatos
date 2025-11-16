from jupyter_client import KernelManager

km = KernelManager(kernel_name='python312')
km.start_kernel()
kc = km.client()
kc.start_channels()
try:
    kc.execute("print('hello-from-kernel')")
    # Collect messages for up to 10 seconds
    import time
    start = time.time()
    while time.time() - start < 10:
        try:
            msg = kc.get_iopub_msg(timeout=2)
        except Exception:
            continue
        mtype = msg['header'].get('msg_type')
        if mtype == 'stream':
            print('KERNEL STREAM:', msg['content'].get('text'))
        elif mtype == 'execute_result':
            print('EXECUTE RESULT:', msg['content'].get('data'))
        elif mtype == 'error':
            print('KERNEL ERROR:', msg['content'])
        elif mtype == 'status' and msg['content'].get('execution_state') == 'idle':
            break
finally:
    kc.stop_channels()
    km.shutdown_kernel()
