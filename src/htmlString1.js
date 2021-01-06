export default `
<div class="article-detail-content">
<h2 id="md-wj-1">Promise的状态</h2>
<ol>
    <li>
        promise操作只会在以下3种状态中的一种：等待态（Pending）、执行态（Fulfilled）和拒绝态（Rejected）
    </li>
    <li>
        promise的状态只会出现从等待状态向执行态或者拒绝态转化，不可以逆转。执行态和拒绝态之间不能相互转换
    </li>
    <li>promise状态一旦被转换，就不能被更改。</li>
</ol>
<h2 id="md-wj-2">Promise流程图了解下(*￣︶￣)</h2>
<p>
    <img
        src="https://mdn.mozillademos.org/files/8633/promises.png"
        alt="Alt text"
        title="Promise 流程图"
    />
</p>
<h2 id="md-wj-3">例 一</h2>
<pre><code><span class="hljs-keyword">var</span> test = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">reslove, reject</span>) </span>{
reslove(<span class="hljs-string">"test"</span>)
<span class="hljs-comment">// or</span>
setTimeout(reslove, <span class="hljs-number">2000</span>, <span class="hljs-string">"test"</span>)
<span class="hljs-comment">// or</span>
resolve(<span class="hljs-built_in">Promise</span>.resolve(<span class="hljs-string">"test"</span>))
})</code></pre>
<p>主入口函数为：</p>
<pre><code><span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">Promise</span>(<span class="hljs-params">fn</span>) </span>{
<span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> <span class="hljs-keyword">this</span> !== <span class="hljs-string">'object'</span>) {
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">TypeError</span>(<span class="hljs-string">'Promises must be constructed via new'</span>)
}
<span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> fn !== <span class="hljs-string">'function'</span>) {
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">TypeError</span>(<span class="hljs-string">"Promise constructor's argument is not a function"</span>)
}
<span class="hljs-comment">// _deferredState == 1 表示 _deferreds 为单个；</span>
<span class="hljs-comment">// _deferredState == 2 表示 _deferreds 为数组；</span>
<span class="hljs-keyword">this</span>._deferredState = <span class="hljs-number">0</span>
<span class="hljs-comment">// 状态值</span>
<span class="hljs-comment">// 0 - pending</span>
<span class="hljs-comment">// 1 - fulfilled with _value</span>
<span class="hljs-comment">// 2 - rejected with _value</span>
<span class="hljs-comment">// 3 - adopted the state of another promise, _value</span>
<span class="hljs-keyword">this</span>._state = <span class="hljs-number">0</span>
<span class="hljs-comment">// 返回结果</span>
<span class="hljs-keyword">this</span>._value = <span class="hljs-literal">null</span>
<span class="hljs-comment">// 用于挂载 Handler 实例；也就是 then 方法中传递的 resolve ， reject方法，以及新的primose实例的引用</span>
<span class="hljs-keyword">this</span>._deferreds = <span class="hljs-literal">null</span>
<span class="hljs-keyword">if</span> (fn === noop) <span class="hljs-keyword">return</span>
 <span class="hljs-comment">// 分解函数</span>
doResolve(fn, <span class="hljs-keyword">this</span>)
}</code></pre>
<p>
    Promise 为构造函数，传入的函数会被doResolve函数注入
    reslove和reject 参数
</p>
<pre><code><span class="hljs-comment">// to avoid using try/catch inside critical functions, we</span>
<span class="hljs-comment">// extract them to here.</span>
<span class="hljs-keyword">var</span> LAST_ERROR = <span class="hljs-literal">null</span>
<span class="hljs-keyword">var</span> IS_ERROR = {}

<span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">doResolve</span>(<span class="hljs-params">fn, promise</span>) </span>{
<span class="hljs-comment">// 锁</span>
<span class="hljs-keyword">var</span> done = <span class="hljs-literal">false</span>
<span class="hljs-keyword">var</span> res = tryCallTwo(fn,
        <span class="hljs-comment">// resolve 回调</span>
        <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">value</span>) </span>{
            <span class="hljs-keyword">if</span> (done) <span class="hljs-keyword">return</span>
            done = <span class="hljs-literal">true</span>
            resolve(promise, value)
        },
        <span class="hljs-comment">// reject 回调</span>
        <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">reason</span>) </span>{
            <span class="hljs-keyword">if</span> (done) <span class="hljs-keyword">return</span>
            done = <span class="hljs-literal">true</span>
            reject(promise, reason)
        }
    )
 <span class="hljs-comment">// 同步异常直接执行 reject</span>
<span class="hljs-keyword">if</span> (!done &amp;&amp; res === IS_ERROR) {
    done = <span class="hljs-literal">true</span>
    reject(promise, LAST_ERROR)
}
}
<span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">tryCallTwo</span>(<span class="hljs-params">fn, a, b</span>) </span>{
<span class="hljs-keyword">try</span> {
<span class="hljs-comment">//注入resolve 和 reject 函数参数</span>
    fn(a, b)
} <span class="hljs-keyword">catch</span> (ex) {
    LAST_ERROR = ex
    <span class="hljs-keyword">return</span> IS_ERROR
}
}</code></pre>
<p>
    done 为锁，当Promise状态修改之后，不能再被修改; tryCallTwo
    为简单的 try catch 函数,LAST_ERROR 用于接收错误信息，IS_ERROR
    为空对象，用于比对是否有错误信息；
</p>
<p>接下来如果当前Promise 执行 resolve 时，进入resolve函数查看；</p>
<pre><code><span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">resolve</span>(<span class="hljs-params">self, newValue</span>) </span>{
<span class="hljs-comment">// Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure</span>

<span class="hljs-comment">// 此处判断用于防止传入自身，无限循环</span>
<span class="hljs-keyword">if</span> (newValue === self) {
    <span class="hljs-keyword">return</span> reject(self, <span class="hljs-keyword">new</span> <span class="hljs-built_in">TypeError</span>(<span class="hljs-string">'A promise cannot be resolved with itself.'</span>))
}
<span class="hljs-comment">// 如果值为复杂类型</span>
<span class="hljs-keyword">if</span> (newValue &amp;&amp; (<span class="hljs-keyword">typeof</span> newValue === <span class="hljs-string">'object'</span> || <span class="hljs-keyword">typeof</span> newValue === <span class="hljs-string">'function'</span>)) {
    <span class="hljs-comment">// 获取 then 方法 </span>
    <span class="hljs-keyword">var</span> then = getThen(newValue)
    <span class="hljs-comment">// 如果 获取 then 方法 报错，直接 reject</span>
    <span class="hljs-keyword">if</span> (then === IS_ERROR) <span class="hljs-keyword">return</span> reject(self, LAST_ERROR)
    <span class="hljs-comment">// newValue为Promise实例</span>
    <span class="hljs-keyword">if</span> (then === self.then &amp;&amp; newValue <span class="hljs-keyword">instanceof</span> <span class="hljs-built_in">Promise</span>) {
        <span class="hljs-comment">// 当状态为3时，外层包裹的Promise实例 直接使用返回的promise实例的状态，在 handle 方法中调用；</span>
        self._state = <span class="hljs-number">3</span>
        self._value = newValue
        finale(self)
        <span class="hljs-keyword">return</span>
    } 
    <span class="hljs-comment">// newValue不为Promise实例，但是包含then方法</span>
    <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> then === <span class="hljs-string">'function'</span>) {
        doResolve(then.bind(newValue), self)
        <span class="hljs-keyword">return</span>
    }
}
<span class="hljs-comment">// 简单值 or 不存在then方法,  直接返回结果，当前Promise状态更新为 fulfilled，调用 finale 方法</span>
self._state = <span class="hljs-number">1</span>
self._value = newValue
finale(self)
}</code></pre>
<p>
    self 为当前promise实例， newValue 为传入 resolve中的值，正常调用
    当前Promise 实例状态会变为 1 （fulfilled）， newValue
    为返回值，挂载到当前 实例的 _value属性上，而后调用 finale方法
</p>
<pre><code><span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">finale</span>(<span class="hljs-params">self</span>) </span>{
<span class="hljs-comment">// 当前实例的 _deferredState 状态在 handle 函数中变更</span>
<span class="hljs-keyword">if</span> (self._deferredState === <span class="hljs-number">1</span>) {
  <span class="hljs-comment">// 调用 handle 函数</span>
    handle(self, self._deferreds)
  <span class="hljs-comment">// 清除对于传入函数的引用</span>
    self._deferreds = <span class="hljs-literal">null</span>
}
<span class="hljs-keyword">if</span> (self._deferredState === <span class="hljs-number">2</span>) {
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">var</span> i = <span class="hljs-number">0</span>; i &lt; self._deferreds.length; i++) {
        handle(self, self._deferreds[i])
    }
    self._deferreds = <span class="hljs-literal">null</span>
}
}</code></pre>

<pre><code><span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">Handler</span>(<span class="hljs-params">onFulfilled, onRejected, promise</span>) </span>{
<span class="hljs-keyword">this</span>.onFulfilled = <span class="hljs-keyword">typeof</span> onFulfilled === <span class="hljs-string">'function'</span> ? onFulfilled : <span class="hljs-literal">null</span>
<span class="hljs-keyword">this</span>.onRejected = <span class="hljs-keyword">typeof</span> onRejected === <span class="hljs-string">'function'</span> ? onRejected : <span class="hljs-literal">null</span>
<span class="hljs-keyword">this</span>.promise = promise
}</code></pre>
<p>接着是介绍 handle 函数：</p>
<pre><code><span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">handle</span>(<span class="hljs-params">self, deferred</span>) </span>{
<span class="hljs-comment">// 当传入的promise实例状态为3时，即该实例的 _value 挂载的为promise实例，直接使用 _value 的状态即可</span>
<span class="hljs-keyword">while</span> (self._state === <span class="hljs-number">3</span>) {
    self = self._value
}
   <span class="hljs-comment">//Promise._onHandle 用于追踪 ，于 rejection-tracking.js 模块中复制，正常不会使用到</span>
<span class="hljs-keyword">if</span> (<span class="hljs-built_in">Promise</span>._onHandle) {
    <span class="hljs-built_in">Promise</span>._onHandle(self)
}
<span class="hljs-comment">// 当 state 为 0 ；记表示当前Promise 实例（self）为异步返回</span>
<span class="hljs-keyword">if</span> (self._state === <span class="hljs-number">0</span>) {
    <span class="hljs-keyword">if</span> (self._deferredState === <span class="hljs-number">0</span>) {
        <span class="hljs-comment">// 变更状态 调用 finale 函数是会用到</span>
        self._deferredState = <span class="hljs-number">1</span>
        <span class="hljs-comment">// 挂载 Handler 实例， 用于保存传入then 方法的函数 和 新 new 出来的Promise实例</span>
        self._deferreds = deferred
        <span class="hljs-keyword">return</span>
    }
    <span class="hljs-comment">// 当前的情况可以查看例三</span>
    <span class="hljs-keyword">if</span> (self._deferredState === <span class="hljs-number">1</span>) {
        self._deferredState = <span class="hljs-number">2</span>
        self._deferreds = [self._deferreds, deferred]
        <span class="hljs-keyword">return</span>
    }
    self._deferreds.push(deferred)
    <span class="hljs-keyword">return</span>
}
<span class="hljs-comment">// 同步调用</span>
handleResolved(self, deferred)
}</code></pre>
<h2 id="md-wj-6">例三</h2>
<pre><code><span class="hljs-comment">// 纠结了我好久 ...</span>
<span class="hljs-keyword">const</span> p = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function"><span class="hljs-params">resolve</span> =&gt;</span> setTimeout(resolve, <span class="hljs-number">2000</span>, <span class="hljs-string">"test"</span>))
p.then(<span class="hljs-function">(<span class="hljs-params">result</span>) =&gt;</span> {
<span class="hljs-built_in">console</span>.log(result) <span class="hljs-comment">// 'a'</span>
})

p.then(<span class="hljs-function">(<span class="hljs-params">result</span>) =&gt;</span> {
<span class="hljs-built_in">console</span>.log(result) <span class="hljs-comment">// 'a'</span>
})

p.then(<span class="hljs-function">(<span class="hljs-params">result</span>) =&gt;</span> {
<span class="hljs-built_in">console</span>.log(result) <span class="hljs-comment">// 'a'</span>
})</code></pre>
<pre><code><span class="hljs-keyword">var</span> test = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function">(<span class="hljs-params">r</span>) =&gt;</span> r(<span class="hljs-string">"test"</span>))   ----&gt;  promise 实例
                                                ↑
                                                |
    .then(<span class="hljs-function"><span class="hljs-params">r</span> =&gt;</span> <span class="hljs-built_in">console</span>.log(r))   ----&gt; 调用handle方法中的<span class="hljs-keyword">this</span>为</code></pre>
<p>
    handle 方法中的 self
    为前一个Promise实例,当self._state==0时，即表示 reslove or reject
    非同步，会将then 中新创建的Promise实例以及参数 resolve
    ，reject函数 挂载到 Handler 实例上，并将实例挂载到
    self（也就是之前的promise实例）
    的<em>deferreds属性上；当self.</em>state 非 0
    值时，即表示self（也就是之前的promise实例 ）已经更改状态，
    直接调用 handleResolved方法，先说下同步调用 handleResolved
    方法：
</p>
<pre><code><span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">handleResolved</span>(<span class="hljs-params">self, deferred</span>) </span>{
<span class="hljs-comment">//源码为调用 asap，这里改写为 setTimeout </span>
<span class="hljs-comment">// 暂未理解 为嘛要走异步</span>
setTimeout(<span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) </span>{
    <span class="hljs-comment">// 因为这里状态已经改变，self._state 的值只有 1 or 2 ，当前一个promise状态为1 时调用onFulfilled（then方法的第一个参数），</span>
    <span class="hljs-comment">// 为2 调用 onRejected（then方法的第二个参数）</span>
    <span class="hljs-keyword">var</span> cb = self._state === <span class="hljs-number">1</span> ? deferred.onFulfilled : deferred.onRejected
    <span class="hljs-comment">// 当 cd 不存在时调用,一般用于 onRejected 函数不传</span>
    <span class="hljs-comment">// 主要作用可以 可以查看 例四</span>
    <span class="hljs-keyword">if</span> (cb === <span class="hljs-literal">null</span>) {
        <span class="hljs-keyword">if</span> (self._state === <span class="hljs-number">1</span>) {
            resolve(deferred.promise, self._value)
        } <span class="hljs-keyword">else</span> {
            reject(deferred.promise, self._value)
        }
        <span class="hljs-keyword">return</span>
    }
    <span class="hljs-comment">// 当cd 不为空时，直接调用 cd 函数 获取返回值,then 方法中只能使同步函数，</span>
    <span class="hljs-comment">// 如要使用异步可以直接用 Promise包裹，返回Promise 实例</span>

    <span class="hljs-keyword">var</span> ret = tryCallOne(cb, self._value)
    <span class="hljs-comment">// 如 cd 调用报错 会返回 IS_ERROR ，直接 reject</span>
    <span class="hljs-keyword">if</span> (ret === IS_ERROR) {
        reject(deferred.promise, LAST_ERROR)
    } <span class="hljs-keyword">else</span> {
        resolve(deferred.promise, ret)
    }
}, <span class="hljs-number">1</span>)
}
<span class="hljs-comment">// tryCallOne 函数</span>
<span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">tryCallOne</span>(<span class="hljs-params">fn, a</span>) </span>{
<span class="hljs-keyword">try</span> { 
    <span class="hljs-comment">// 给 then 方法里面的函数注入参数</span>
    <span class="hljs-keyword">return</span> fn(a)
} <span class="hljs-keyword">catch</span> (ex) {
    LAST_ERROR = ex
    <span class="hljs-keyword">return</span> IS_ERROR
}
}</code></pre>
<p>
    这里就回到了之前调用 resolve 和 reject 方法
    ，形成了一个闭环,到这里
    主要功能了解完了，接下来查看一些其他Promise上的常用方法
</p>
<h2 id="md-wj-7">例四</h2>
<pre><code><span class="hljs-keyword">var</span> test1 = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function">(<span class="hljs-params">resolve,reject</span>)=&gt;</span>resolve(<span class="hljs-string">"test1"</span>))
.then().then(<span class="hljs-function"><span class="hljs-params">reslut</span>=&gt;</span><span class="hljs-built_in">console</span>.log(reslut,<span class="hljs-string">"11111"</span>),err=&gt;<span class="hljs-built_in">console</span>.log(err,<span class="hljs-string">"222222"</span>))
<span class="hljs-comment">// test1 1111</span>

<span class="hljs-keyword">var</span> test2 = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function">(<span class="hljs-params">resolve,reject</span>)=&gt;</span>re(<span class="hljs-string">"test2"</span>))
.then().then(<span class="hljs-function"><span class="hljs-params">reslut</span>=&gt;</span><span class="hljs-built_in">console</span>.log(reslut,<span class="hljs-string">"11111"</span>),err=&gt;<span class="hljs-built_in">console</span>.log(err,<span class="hljs-string">"222222"</span>))
<span class="hljs-comment">// test2 222222</span></code></pre>
<h2 id="md-wj-8">Promise done 方法</h2>
<pre><code><span class="hljs-built_in">Promise</span>.prototype.done = <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">onFulfilled, onRejected</span>) </span>{
<span class="hljs-keyword">var</span> self = <span class="hljs-built_in">arguments</span>.length ? <span class="hljs-keyword">this</span>.then.apply(<span class="hljs-keyword">this</span>, <span class="hljs-built_in">arguments</span>) : <span class="hljs-keyword">this</span>;
self.then(<span class="hljs-literal">null</span>, <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">err</span>) </span>{
setTimeout(<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params"></span>) </span>{
  <span class="hljs-keyword">throw</span> err;
}, <span class="hljs-number">0</span>);
});
};</code></pre>
<p>done 方法只是 调用了 then方法而已，但是不会返回 Promise实例</p>
<h2 id="md-wj-9">Promise catch 方法</h2>
<pre><code><span class="hljs-built_in">Promise</span>.prototype[<span class="hljs-string">'catch'</span>] = <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">onRejected</span>) </span>{
<span class="hljs-keyword">return</span> <span class="hljs-keyword">this</span>.then(<span class="hljs-literal">null</span>, onRejected);
};</code></pre>
<p>同理也是调用的then方法，将传入的函数作为onRejected函数</p>
<h2 id="md-wj-10">Promise resolve 方法</h2>
<pre><code><span class="hljs-keyword">var</span> TRUE = valuePromise(<span class="hljs-literal">true</span>);
<span class="hljs-keyword">var</span> FALSE = valuePromise(<span class="hljs-literal">false</span>);
<span class="hljs-keyword">var</span> NULL = valuePromise(<span class="hljs-literal">null</span>);
<span class="hljs-keyword">var</span> UNDEFINED = valuePromise(<span class="hljs-literal">undefined</span>);
<span class="hljs-keyword">var</span> ZERO = valuePromise(<span class="hljs-number">0</span>);
<span class="hljs-keyword">var</span> EMPTYSTRING = valuePromise(<span class="hljs-string">''</span>);
<span class="hljs-comment">//设置Promise的状态为 1 ,传入的value 作为返回值</span>
<span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">valuePromise</span>(<span class="hljs-params">value</span>) </span>{
<span class="hljs-comment">//Promise._noop 为 function noop(){},之前有挂载的</span>
<span class="hljs-keyword">var</span> p = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-built_in">Promise</span>._noop);
p._state = <span class="hljs-number">1</span>;
p._value = value;
<span class="hljs-keyword">return</span> p;
}
<span class="hljs-built_in">Promise</span>.resolve = <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">value</span>) </span>{
<span class="hljs-keyword">if</span> (value <span class="hljs-keyword">instanceof</span> <span class="hljs-built_in">Promise</span>) <span class="hljs-keyword">return</span> value;

<span class="hljs-keyword">if</span> (value === <span class="hljs-literal">null</span>) <span class="hljs-keyword">return</span> NULL;
<span class="hljs-keyword">if</span> (value === <span class="hljs-literal">undefined</span>) <span class="hljs-keyword">return</span> UNDEFINED;
<span class="hljs-keyword">if</span> (value === <span class="hljs-literal">true</span>) <span class="hljs-keyword">return</span> TRUE;
<span class="hljs-keyword">if</span> (value === <span class="hljs-literal">false</span>) <span class="hljs-keyword">return</span> FALSE;
<span class="hljs-keyword">if</span> (value === <span class="hljs-number">0</span>) <span class="hljs-keyword">return</span> ZERO;
<span class="hljs-keyword">if</span> (value === <span class="hljs-string">''</span>) <span class="hljs-keyword">return</span> EMPTYSTRING;

<span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> value === <span class="hljs-string">'object'</span> || <span class="hljs-keyword">typeof</span> value === <span class="hljs-string">'function'</span>) {
<span class="hljs-keyword">try</span> {
  <span class="hljs-comment">// 如果包含 then方法，将then方法传入作为 new Promise 的参数</span>
  <span class="hljs-keyword">var</span> then = value.then;
  <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> then === <span class="hljs-string">'function'</span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(then.bind(value));
  }
} <span class="hljs-keyword">catch</span> (ex) {
  <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">resolve, reject</span>) </span>{
    reject(ex);
  });
}
}
<span class="hljs-keyword">return</span> valuePromise(value);
};</code></pre>
<p>简单的包装为 Promise 而已，修改状态值，设置默认返回值；</p>
<h2 id="md-wj-11">Promise reject 方法</h2>
<pre><code><span class="hljs-built_in">Promise</span>.reject = <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">value</span>) </span>{
<span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">resolve, reject</span>) </span>{
reject(value);
});
};</code></pre>
<p>同上….</p>
<h2 id="md-wj-12">Promise race 方法</h2>
<pre><code><span class="hljs-built_in">Promise</span>.race = <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">values</span>) </span>{
<span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">resolve, reject</span>) </span>{
values.forEach(<span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">value</span>)</span>{
  <span class="hljs-built_in">Promise</span>.resolve(value).then(resolve, reject);
});
});
};</code></pre>
<p>
    race 放发是将数组值用 Promise.resolve 包裹
    ，最先改变状态的值作为当前Promise状态返回
</p>
<h2 id="md-wj-13">Promise all 方法</h2>
<pre><code><span class="hljs-built_in">Promise</span>.all = <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">arr</span>) </span>{
<span class="hljs-keyword">var</span> args = <span class="hljs-built_in">Array</span>.prototype.slice.call(arr);
<span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">resolve, reject</span>) </span>{
<span class="hljs-keyword">if</span> (args.length === <span class="hljs-number">0</span>) <span class="hljs-keyword">return</span> resolve([]);
<span class="hljs-comment">// remaining 为数组长度</span>
<span class="hljs-keyword">var</span> remaining = args.length;
<span class="hljs-comment">//主要函数</span>
<span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">res</span>(<span class="hljs-params">i, val</span>) </span>{
  <span class="hljs-comment">// 这里 类似于 then 方法中的判断</span>
  <span class="hljs-keyword">if</span> (val &amp;&amp; (<span class="hljs-keyword">typeof</span> val === <span class="hljs-string">'object'</span> || <span class="hljs-keyword">typeof</span> val === <span class="hljs-string">'function'</span>)) {
    <span class="hljs-comment">//表示为 Promise实例</span>
    <span class="hljs-keyword">if</span> (val <span class="hljs-keyword">instanceof</span> <span class="hljs-built_in">Promise</span> &amp;&amp; val.then === <span class="hljs-built_in">Promise</span>.prototype.then) {
      <span class="hljs-keyword">while</span> (val._state === <span class="hljs-number">3</span>) {
        val = val._value;
      }
      <span class="hljs-comment">// 如果 state === 1 ， 表示已通过，再次调用的目的在于传入值用于替换args[i]中的函数</span>
      <span class="hljs-keyword">if</span> (val._state === <span class="hljs-number">1</span>) <span class="hljs-keyword">return</span> res(i, val._value);
      <span class="hljs-comment">// 如果 state === 2 , 当前 Promise 实例直接 reject </span>
      <span class="hljs-keyword">if</span> (val._state === <span class="hljs-number">2</span>) reject(val._value);
      <span class="hljs-comment">// 如果 state === 0 , 调用 then 方法 </span>
      val.then(<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">val</span>) </span>{
        res(i, val);
      }, reject);
      <span class="hljs-keyword">return</span>;
    } <span class="hljs-keyword">else</span> {
      <span class="hljs-keyword">var</span> then = val.then;
      <span class="hljs-comment">// 如果不含 then 方法 直接往下走</span>
      <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> then === <span class="hljs-string">'function'</span>) {
        <span class="hljs-keyword">var</span> p = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(then.bind(val));
        p.then(<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">val</span>) </span>{
          res(i, val);
        }, reject);
        <span class="hljs-keyword">return</span>;
      }
    }
  }
  <span class="hljs-comment">// 简单值和 不含then 方法的复杂值 直接作为返回值</span>
  <span class="hljs-comment">// 将返回值替换 args 中的值</span>
  args[i] = val;
  <span class="hljs-comment">// 执行到这相当于 一个值 转换已完成</span>
  <span class="hljs-keyword">if</span> (--remaining === <span class="hljs-number">0</span>) {
    <span class="hljs-comment">//remaining === 0 表示所有值转换都已完成 调用 resolve</span>
    resolve(args);
  }
}
<span class="hljs-comment">//循环将 值放入 res 函数中作为参数</span>
<span class="hljs-keyword">for</span> (<span class="hljs-keyword">var</span> i = <span class="hljs-number">0</span>; i &lt; args.length; i++) {
  res(i, args[i]);
}
});
};</code></pre>
<p>
    all 方法当 所有值 resolve 时， Promise 实例才会resolve，
    返回值为数组，并一一对应传入顺序，如一个reject
    ，则当前实例状态变更为 reject
</p>
<p>能看懂一点点了，不错不错 (^o^)/~</p>
<h2 id="md-wj-14">
    Promise 新增了一些其他的方法，书写一些 Polyfill 版本
</h2>
<h3 id="md-wj-15">finally</h3>
<pre><code><span class="hljs-built_in">Promise</span>.prototype.finally = <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">fn</span>) </span>{
<span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> fn !== <span class="hljs-string">"function"</span>) <span class="hljs-keyword">return</span> <span class="hljs-keyword">this</span>;
<span class="hljs-keyword">return</span> <span class="hljs-keyword">this</span>.then(
<span class="hljs-function">(<span class="hljs-params">data</span>) =&gt;</span> {
  fn();
  <span class="hljs-keyword">return</span> data;
},
(err) =&gt; {
  <span class="hljs-keyword">try</span> {
    fn();
  } <span class="hljs-keyword">catch</span> (error) {
    err = error;
  }
  <span class="hljs-keyword">throw</span> err;
}
);
};</code></pre>
<h3 id="md-wj-16">allSettled</h3>
<pre><code><span class="hljs-built_in">Promise</span>.allSettled = <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">arr</span>) </span>{
<span class="hljs-keyword">var</span> args = <span class="hljs-built_in">Array</span>.prototype.slice.call(arr);
<span class="hljs-keyword">debugger</span>
<span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">resolve, reject</span>) </span>{
<span class="hljs-keyword">if</span> (args.length === <span class="hljs-number">0</span>) <span class="hljs-keyword">return</span> resolve([]);
<span class="hljs-keyword">var</span> remaining = args.length;
<span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">res</span>(<span class="hljs-params">i, val</span>) </span>{
  <span class="hljs-keyword">if</span> (val &amp;&amp; (<span class="hljs-keyword">typeof</span> val === <span class="hljs-string">"object"</span> || <span class="hljs-keyword">typeof</span> val === <span class="hljs-string">"function"</span>)) {
    <span class="hljs-keyword">if</span> (
      val <span class="hljs-keyword">instanceof</span> <span class="hljs-built_in">Promise</span> &amp;&amp;
      val.then === <span class="hljs-built_in">Promise</span>.prototype.then
    ) {
      <span class="hljs-keyword">while</span> (val._state === <span class="hljs-number">3</span>) {
        val = val._value;
      }
      <span class="hljs-comment">// 如果 state === 1 ， 表示已通过，再次调用的目的在于传入值用于替换args[i]中的函数</span>
      <span class="hljs-keyword">if</span> (val._state === <span class="hljs-number">1</span>)
        <span class="hljs-keyword">return</span> res(i, { <span class="hljs-attr">status</span>: <span class="hljs-string">"fulfilled"</span>, <span class="hljs-attr">value</span>: val._value });
      <span class="hljs-comment">// 如果 state === 2 , 当前 Promise 实例直接 reject</span>
      <span class="hljs-keyword">if</span> (val._state === <span class="hljs-number">2</span>) {
        <span class="hljs-comment">// reject(val._value);</span>
        <span class="hljs-keyword">return</span> res(i, { <span class="hljs-attr">status</span>: <span class="hljs-string">"rejected"</span>, <span class="hljs-attr">reason</span>: val._value });
      }
      val.then(
        <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">val</span>) </span>{
          res(i, { <span class="hljs-attr">status</span>: <span class="hljs-string">"fulfilled"</span>, <span class="hljs-attr">value</span>: val });
        },
        <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">err</span>) </span>{
          res(i, { <span class="hljs-attr">status</span>: <span class="hljs-string">"rejected"</span>, <span class="hljs-attr">reason</span>: err });
        }
      );
      <span class="hljs-keyword">return</span>;
    } <span class="hljs-keyword">else</span> {
      <span class="hljs-keyword">var</span> then = val.then;
      <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> then === <span class="hljs-string">"function"</span>) {
        <span class="hljs-keyword">var</span> p = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(then.bind(val));
        p.then(
          <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">val</span>) </span>{
            res(i, { <span class="hljs-attr">status</span>: <span class="hljs-string">"fulfilled"</span>, <span class="hljs-attr">value</span>: val });
          },
          <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">err</span>) </span>{
            res(i, { <span class="hljs-attr">status</span>: <span class="hljs-string">"rejected"</span>, <span class="hljs-attr">reason</span>: err });
          }
        );
        <span class="hljs-keyword">return</span>;
      }
    }
  }
  <span class="hljs-comment">// 简单值和 不含then 方法的复杂值 直接作为返回值</span>
  <span class="hljs-comment">// 将返回值替换 args 中的值</span>
  args[i] = val;
  <span class="hljs-comment">// 执行到这相当于 一个值 转换已完成</span>
  <span class="hljs-keyword">if</span> (--remaining === <span class="hljs-number">0</span>) {
    <span class="hljs-comment">//remaining === 0 表示所有值转换都已完成 调用 resolve</span>
    resolve(args);
  }
}
<span class="hljs-comment">//循环将 值放入 res 函数中作为参数</span>
<span class="hljs-keyword">for</span> (<span class="hljs-keyword">var</span> i = <span class="hljs-number">0</span>; i &lt; args.length; i++) {
  res(i, args[i]);
}
});
};</code></pre>
<ol>
    <li>
        <a
            target="_blank"
            href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise"
            >参考于 MDN Promise</a
        >
    </li>
    <li>
        <a target="_blank" href="https://github.com/then/promise"
            >参考于 github Promise</a
        >
    </li>
</ol>
</div>

`;
